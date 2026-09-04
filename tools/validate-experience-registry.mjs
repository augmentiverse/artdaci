import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const REGISTRY_PATH = 'content/registry.json';
const REQUIRED_ARTWORK_IDS = [
  'ldv-ml','ldv-ls','ldv-le','ldv-an','ldv-gb','ldv-bf',
  'ver-gpe','ver-mm','ver-vd','ver-ap','ver-as','ver-wb',
  'vg-sp','vg-sn','vg-sf','vg-br','vg-ct','vg-nc',
  'mon-is','mon-wl','mon-jb','mon-po','mon-wp','mon-pa'
];
const REQUIRED_LANGS = ['fr', 'en', 'ar'];
const FILE_EXTENSIONS = new Set([
  '.html', '.json', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
  '.mp3', '.m4a', '.wav', '.ogg', '.mp4', '.webm',
  '.glb', '.gltf', '.usdz', '.mind', '.vtt', '.srt'
]);

const trackedFiles = new Set(
  execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .map((file) => file.replace(/\\/g, '/'))
);
const errors = [];
const warnings = [];
const checkedAssets = new Set();

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function trackedOrPresent(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  return trackedFiles.has(normalized) || fs.existsSync(path.join(ROOT, normalized));
}
function readJson(relativePath) {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) {
    fail(`JSON not materialized in checkout: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function localFileFromReference(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || /^(?:https?:|data:|mailto:|tel:|javascript:)/i.test(trimmed)) return null;
  const withoutFragment = trimmed.split('#')[0].split('?')[0];
  if (!withoutFragment) return null;
  const ext = path.extname(withoutFragment).toLowerCase();
  if (!FILE_EXTENSIONS.has(ext)) return null;
  let clean = withoutFragment.replace(/^\/+/, '');
  try { clean = decodeURIComponent(clean); } catch {}
  return clean.replace(/\\/g, '/');
}

function checkLocalReference(value, context) {
  const local = localFileFromReference(value);
  if (!local) return;
  checkedAssets.add(local);
  if (!trackedOrPresent(local)) fail(`Missing local resource (${context}): ${local}`);
}

function scanObject(value, context = '') {
  if (typeof value === 'string') {
    checkLocalReference(value, context);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanObject(item, `${context}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) scanObject(child, context ? `${context}.${key}` : key);
  }
}

const registry = readJson(REGISTRY_PATH);
if (!registry) process.exit(1);

if (registry.referenceModel !== 'experience-hub-v1') fail('registry.referenceModel must remain experience-hub-v1');
if (registry.baseExperiencePath !== '/x') fail('registry.baseExperiencePath must remain /x');
if (!registry.items || typeof registry.items !== 'object') fail('registry.items is missing');

const items = registry.items || {};
for (const id of REQUIRED_ARTWORK_IDS) {
  if (!items[id]) fail(`Reserved artwork ID missing from registry: ${id}`);
}

const seenSlugs = new Map();
for (const [publicId, entry] of Object.entries(items)) {
  if (!/^(?:ldv|ver|vg|mon|mus)-[a-z0-9-]+$/.test(publicId)) warn(`Public ID does not match the ARTDACI v1 naming convention: ${publicId}`);
  if (!['painting', 'museum'].includes(entry.type)) fail(`${publicId}: unsupported type ${entry.type}`);
  if (!entry.manifest) fail(`${publicId}: manifest is required`);
  if (!entry.slug) fail(`${publicId}: slug is required`);

  if (entry.type === 'painting') {
    for (const lang of REQUIRED_LANGS) {
      if (!entry.languages?.includes(lang)) fail(`${publicId}: language ${lang} is missing`);
      if (!entry.title?.[lang]) warn(`${publicId}: localized title ${lang} is missing`);
    }
  }

  if (entry.slug) {
    const previous = seenSlugs.get(entry.slug);
    if (previous && previous !== publicId) fail(`Duplicate registry slug "${entry.slug}" for ${previous} and ${publicId}`);
    seenSlugs.set(entry.slug, publicId);
  }

  checkLocalReference(entry.manifest, `${publicId}.manifest`);
  checkLocalReference(entry.image, `${publicId}.image`);
  scanObject(entry.printPage, `${publicId}.printPage`);

  const manifest = entry.manifest ? readJson(entry.manifest) : null;
  if (manifest) {
    if (Array.isArray(manifest)) fail(`${publicId}: manifest must be an object, not an array`);
    if (manifest.slug && manifest.slug !== entry.slug) fail(`${publicId}: registry slug "${entry.slug}" differs from manifest slug "${manifest.slug}"`);
    scanObject(manifest, `${publicId}.manifest`);
  }

  if (entry.museumId) {
    const museum = items[entry.museumId];
    if (!museum) fail(`${publicId}: museumId ${entry.museumId} does not resolve`);
    else if (museum.type !== 'museum') fail(`${publicId}: museumId ${entry.museumId} is not a museum entry`);
  }

  const related = entry.relatedPaintingIds || (entry.relatedPaintingId ? [entry.relatedPaintingId] : []);
  for (const relatedId of related) {
    const painting = items[relatedId];
    if (!painting) fail(`${publicId}: related painting ${relatedId} does not resolve`);
    else if (painting.type !== 'painting') fail(`${publicId}: related ID ${relatedId} is not a painting`);
  }
}

console.log(`ARTDACI registry validation: ${Object.keys(items).length} entries, ${checkedAssets.size} local references checked.`);
for (const message of warnings) console.warn(`WARNING: ${message}`);
if (errors.length) {
  for (const message of errors) console.error(`ERROR: ${message}`);
  console.error(`Validation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`Validation passed with ${warnings.length} warning(s).`);
