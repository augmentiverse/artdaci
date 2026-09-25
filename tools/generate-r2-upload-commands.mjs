import fs from 'node:fs';
import path from 'node:path';

const mapPath = process.argv[2] || 'docs/production/migrations/mona-lisa-r2.json';
const bucket = process.argv[3] || 'artdaci-media';
const migration = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

console.log('#!/usr/bin/env bash');
console.log('set -euo pipefail');
console.log('');
console.log(`# Generated from ${mapPath}`);
console.log(`# Public ID: ${migration.publicId}`);
console.log(`# Bucket: ${bucket}`);
console.log('# This script uploads/copies only. It never deletes GitHub source files.');
console.log('');

for (const object of migration.objects || []) {
  const objectPath = `${bucket}/${object.targetKey}`;
  const parts = [
    'npx wrangler r2 object put',
    shellQuote(objectPath),
    `--file=${shellQuote(object.source)}`,
    '--remote',
    `--content-type=${shellQuote(object.contentType)}`,
    `--cache-control=${shellQuote('public, max-age=31536000, immutable')}`
  ];
  console.log(parts.join(' '));
}

console.log('');
console.log(`# ${migration.objects?.length || 0} objects planned; verify media origin URLs before switching manifests.`);
