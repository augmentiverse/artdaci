import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestsRoot = join(repositoryRoot, "content", "media-manifests");
const catalogPath = join(manifestsRoot, "catalog.json");
const schemaPath = join(manifestsRoot, "schema", "artwork-media-manifest.schema.json");
const families = ["images", "audio", "videos", "models", "ar"];
const artistIds = ["ld", "ve", "vg", "mo"];
const statuses = new Set(["planned", "published", "quarantined-unused", "quarantined-duplicate"]);
const errors = [];

function report(condition, location, message) {
  if (!condition) errors.push(`${location}: ${message}`);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isMediaAsset(value) {
  return isRecord(value) && ("path" in value || "available" in value || "scope" in value);
}

async function loadJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    errors.push(`${relative(repositoryRoot, path)}: ${error.message}`);
    return null;
  }
}

function validateUrl(value, expectedHost, prefix, location) {
  try {
    const url = new URL(value);
    report(url.protocol === "https:", location, "must use HTTPS");
    report(url.hostname === expectedHost, location, `must use ${expectedHost}`);
    report(url.pathname.startsWith(prefix), location, `path must start with ${prefix}`);
    report(!url.username && !url.password, location, "must not contain credentials");
    report(!url.search && !url.hash, location, "must not contain a query or fragment");
  } catch {
    report(false, location, "must be a valid URL");
  }
}

function validateAsset(asset, family, location) {
  report(["artwork", "shared"].includes(asset.scope), location, "scope must be artwork or shared");
  report(typeof asset.path === "string", location, "path is required");
  report(typeof asset.mimeType === "string" && asset.mimeType.includes("/"), location, "mimeType is required");
  report(typeof asset.available === "boolean", location, "available must be a boolean");
  report(statuses.has(asset.migrationStatus), location, "migrationStatus is invalid");

  if (typeof asset.path === "string") {
    report(!asset.path.startsWith("/"), location, "path must be relative");
    report(!asset.path.includes("\\"), location, "path must not contain backslashes");
    report(!asset.path.includes(":"), location, "path must not contain a protocol");
    report(!asset.path.includes("%"), location, "path must not contain encoded segments");
    report(!asset.path.split("/").some((part) => !part || part === "." || part === ".."), location, "path contains an invalid segment");
    report(asset.path.startsWith(`${family}/`), location, `path must remain in the ${family} family`);
    report(/^[a-z0-9][a-z0-9./-]*[a-z0-9]$/.test(asset.path), location, "path must be lowercase ASCII kebab-case");
  }

  if (asset.available === true) {
    report(asset.migrationStatus === "published", location, "available media must be published");
  }
  if (["quarantined-unused", "quarantined-duplicate"].includes(asset.migrationStatus)) {
    report(asset.available === false, location, "quarantined media must remain unavailable");
  }
  if (asset.sha256 !== undefined) {
    report(/^[a-f0-9]{64}$/.test(asset.sha256), location, "sha256 must contain 64 lowercase hexadecimal characters");
  }
}

function validateMediaNode(node, family, location) {
  if (isMediaAsset(node)) {
    validateAsset(node, family, location);
    return 1;
  }

  report(isRecord(node), location, "media node must be an object");
  if (!isRecord(node)) return 0;

  let count = 0;
  for (const [key, value] of Object.entries(node)) {
    report(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key), `${location}.${key}`, "key must be lowercase ASCII kebab-case");
    count += validateMediaNode(value, family, `${location}.${key}`);
  }
  return count;
}

function validateManifest(manifest, path) {
  const location = relative(repositoryRoot, path);
  if (!isRecord(manifest)) return 0;

  report(manifest.schemaVersion === "2.0", location, "schemaVersion must be 2.0");
  report(/^(ld|ve|vg|mo)0[1-8]$/.test(manifest.id), location, "id is invalid");
  report(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.slug), location, "slug is invalid");
  report(manifest.artist?.id === manifest.id?.slice(0, 2), location, "artist id must match artwork id");
  report(manifest.cachePolicy === "no-store", location, "cachePolicy must be no-store during migration");
  report(manifest.sharedMediaBaseUrl === "https://media.artdaci.com/shared/", location, "sharedMediaBaseUrl is invalid");
  report(manifest.mediaBaseUrl === `https://media.artdaci.com/artworks/${manifest.id}/`, location, "mediaBaseUrl must match the artwork id");
  validateUrl(manifest.pageUrl, "artdaci.com", "/", `${location}.pageUrl`);
  validateUrl(manifest.mediaBaseUrl, "media.artdaci.com", `/artworks/${manifest.id}/`, `${location}.mediaBaseUrl`);
  validateUrl(manifest.sharedMediaBaseUrl, "media.artdaci.com", "/shared/", `${location}.sharedMediaBaseUrl`);

  report(isRecord(manifest.media), location, "media is required");
  if (!isRecord(manifest.media)) return 0;
  report(!("shared" in manifest.media), location, "media.shared is forbidden");

  const unexpectedFamilies = Object.keys(manifest.media).filter((key) => !families.includes(key));
  report(unexpectedFamilies.length === 0, location, `unexpected media families: ${unexpectedFamilies.join(", ")}`);

  let assetCount = 0;
  for (const family of families) {
    report(isRecord(manifest.media[family]), `${location}.media.${family}`, "family is required");
    if (isRecord(manifest.media[family])) {
      assetCount += validateMediaNode(manifest.media[family], family, `${location}.media.${family}`);
    }
  }

  report(assetCount > 0, location, "manifest must contain at least one media asset");
  return assetCount;
}

async function validateCatalog(catalog) {
  const location = relative(repositoryRoot, catalogPath);
  if (!isRecord(catalog)) return new Map();

  report(catalog.schemaVersion === "2.0", location, "schemaVersion must be 2.0");
  report(catalog.manifestSchema === "schema/artwork-media-manifest.schema.json", location, "manifestSchema path is invalid");
  report(Array.isArray(catalog.artists) && catalog.artists.length === 4, location, "catalog must contain four artists");
  report(Array.isArray(catalog.artworks) && catalog.artworks.length === 32, location, "catalog must contain 32 artwork slots");

  const entries = new Map();
  for (const artwork of catalog.artworks ?? []) {
    const itemLocation = `${location}.${artwork.id ?? "unknown"}`;
    report(!entries.has(artwork.id), itemLocation, "id must be unique");
    entries.set(artwork.id, artwork);
    report(/^(ld|ve|vg|mo)0[1-8]$/.test(artwork.id), itemLocation, "id is invalid");
    report(artwork.artistId === artwork.id?.slice(0, 2), itemLocation, "artistId must match id");

    const sequence = Number(artwork.id?.slice(2));
    if (sequence <= 6) {
      report(artwork.status === "active", itemLocation, "slots 01-06 must be active");
      report(typeof artwork.slug === "string", itemLocation, "active artwork requires a slug");
      report(isRecord(artwork.title), itemLocation, "active artwork requires localized titles");
      report(isRecord(artwork.manifest), itemLocation, "active artwork requires manifest status");
    } else {
      report(artwork.status === "reserved", itemLocation, "slots 07-08 must be reserved");
      report(artwork.slug === undefined && artwork.title === undefined && artwork.manifest === undefined, itemLocation, "reserved slot must not define artwork data");
    }

    if (artwork.manifest?.status === "source-ready") {
      const relativePath = artwork.manifest.path;
      report(typeof relativePath === "string", itemLocation, "source-ready manifest requires a path");
      if (typeof relativePath === "string") {
        const manifestPath = normalize(join(manifestsRoot, relativePath));
        report(!relative(manifestsRoot, manifestPath).startsWith(".."), itemLocation, "manifest path escapes its root");
        try {
          await access(manifestPath);
        } catch {
          report(false, itemLocation, `manifest does not exist: ${relativePath}`);
        }
      }
    } else if (artwork.status === "active") {
      report(artwork.manifest?.status === "planned", itemLocation, "active manifest status must be planned or source-ready");
    }
  }

  for (const artistId of artistIds) {
    for (let sequence = 1; sequence <= 8; sequence += 1) {
      const id = `${artistId}${String(sequence).padStart(2, "0")}`;
      report(entries.has(id), location, `missing catalog slot ${id}`);
    }
  }

  report([...entries.values()].filter((item) => item.status === "active").length === 24, location, "catalog must contain 24 active artworks");
  report([...entries.values()].filter((item) => item.status === "reserved").length === 8, location, "catalog must contain 8 reserved slots");
  return entries;
}

const schema = await loadJson(schemaPath);
report(schema?.$schema === "https://json-schema.org/draft/2020-12/schema", relative(repositoryRoot, schemaPath), "must use JSON Schema draft 2020-12");
report(schema?.properties?.schemaVersion?.const === "2.0", relative(repositoryRoot, schemaPath), "must describe schema version 2.0");

const catalog = await loadJson(catalogPath);
const catalogEntries = await validateCatalog(catalog);
const artworkDirectories = await readdir(join(manifestsRoot, "artworks"), { withFileTypes: true });
let manifestCount = 0;
let assetCount = 0;

for (const directory of artworkDirectories.filter((entry) => entry.isDirectory())) {
  const manifestPath = join(manifestsRoot, "artworks", directory.name, "manifest.json");
  const manifest = await loadJson(manifestPath);
  if (!manifest) continue;
  manifestCount += 1;
  assetCount += validateManifest(manifest, manifestPath);
  report(manifest.id === directory.name, relative(repositoryRoot, manifestPath), "manifest id must match its directory");
  report(catalogEntries.get(manifest.id)?.manifest?.status === "source-ready", relative(repositoryRoot, manifestPath), "manifest must be source-ready in catalog");
}

if (errors.length > 0) {
  console.error(`Media manifest validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Media manifest validation passed.");
  console.log("Catalog: 24 active artworks, 8 reserved identifiers.");
  console.log(`Canonical manifests: ${manifestCount}; media entries: ${assetCount}.`);
}
