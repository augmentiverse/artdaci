import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/registry.json'), 'utf8'));
const MEDIA_EXTENSIONS = new Set(['.jpg','.jpeg','.png','.webp','.gif','.mp3','.m4a','.wav','.ogg','.mp4','.webm','.glb','.gltf','.usdz','.mind']);
const HEAVY_BYTES = 2 * 1024 * 1024;

function gitBlobSizes() {
  const output = execFileSync('git', ['ls-tree', '-r', '-l', '-z', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  });
  const sizes = new Map();
  for (const record of output.split('\0')) {
    if (!record) continue;
    const tab = record.indexOf('\t');
    if (tab < 0) continue;
    const meta = record.slice(0, tab).trim().split(/\s+/);
    const file = record.slice(tab + 1).replace(/\\/g, '/');
    const size = Number(meta[3]);
    if (Number.isFinite(size)) sizes.set(file, size);
  }
  return sizes;
}

const fileSizes = gitBlobSizes();

function normalizeLocal(value) {
  if (typeof value !== 'string' || /^(?:https?:|data:)/i.test(value)) return null;
  let clean = value.split('#')[0].split('?')[0].replace(/^\/+/, '');
  if (!MEDIA_EXTENSIONS.has(path.extname(clean).toLowerCase())) return null;
  try { clean = decodeURIComponent(clean); } catch {}
  return clean.replace(/\\/g, '/');
}

function collect(value, bag) {
  if (typeof value === 'string') {
    const local = normalizeLocal(value);
    if (local) bag.add(local);
    return;
  }
  if (Array.isArray(value)) return value.forEach((item) => collect(item, bag));
  if (value && typeof value === 'object') Object.values(value).forEach((item) => collect(item, bag));
}

function category(file) {
  const ext = path.extname(file).toLowerCase();
  if (['.mp3','.m4a','.wav','.ogg'].includes(ext)) return 'audio';
  if (['.mp4','.webm'].includes(ext)) return 'video';
  if (['.glb','.gltf','.usdz'].includes(ext)) return '3d';
  if (ext === '.mind') return 'target';
  return 'image';
}

function mb(bytes) { return (bytes / 1024 / 1024).toFixed(2); }

const rows = [];
const unique = new Map();
const missingSize = [];
for (const [publicId, entry] of Object.entries(registry.items || {})) {
  if (!entry.manifest) continue;
  const fullManifest = path.join(ROOT, entry.manifest);
  if (!fs.existsSync(fullManifest)) continue;
  const manifest = JSON.parse(fs.readFileSync(fullManifest, 'utf8'));
  const refs = new Set();
  collect(manifest, refs);
  collect(entry.image, refs);

  for (const file of refs) {
    const bytes = fileSizes.get(file);
    if (!Number.isFinite(bytes)) {
      missingSize.push({ publicId, file });
      continue;
    }
    const item = { publicId, file, bytes, category: category(file) };
    rows.push(item);
    if (!unique.has(file)) unique.set(file, item);
  }
}

const uniqueRows = [...unique.values()].sort((a, b) => b.bytes - a.bytes);
const totals = uniqueRows.reduce((acc, row) => {
  acc.total += row.bytes;
  acc[row.category] = (acc[row.category] || 0) + row.bytes;
  return acc;
}, { total: 0 });
const heavy = uniqueRows.filter((row) => row.bytes >= HEAVY_BYTES);

console.log('# ARTDACI Experience media audit');
console.log('');
console.log(`Referenced unique media: **${uniqueRows.length} files / ${mb(totals.total)} MB**`);
console.log('');
console.log('| Category | Size |');
console.log('|---|---:|');
for (const key of ['3d','video','audio','image','target']) {
  console.log(`| ${key} | ${mb(totals[key] || 0)} MB |`);
}
console.log('');
console.log(`## Migration candidates (>= ${mb(HEAVY_BYTES)} MB)`);
console.log('');
console.log('| Size | Type | Referenced by | File |');
console.log('|---:|---|---|---|');
for (const row of heavy.slice(0, 80)) {
  const owners = [...new Set(rows.filter((candidate) => candidate.file === row.file).map((candidate) => candidate.publicId))].join(', ');
  console.log(`| ${mb(row.bytes)} MB | ${row.category} | ${owners} | \`${row.file}\` |`);
}

if (missingSize.length) {
  console.log('');
  console.log('## References without Git blob-size metadata');
  console.log('');
  for (const item of missingSize.slice(0, 40)) console.log(`- ${item.publicId}: \`${item.file}\``);
}

console.log('');
console.log('## Migration policy');
console.log('');
console.log('- Keep `.mind` targets, UI assets and small thumbnails in GitHub.');
console.log('- Move large `.glb`, `.mp4`, `.mp3`/`.m4a`, panoramas and high-resolution masters to `media.artdaci.com`.');
console.log('- Migrate only files referenced by a manifest first; unreferenced legacy binaries can be cleaned up separately after dependency review.');
console.log('- Never change `/x/{lang}/{publicId}` while media locations change.');
