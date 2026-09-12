#!/usr/bin/env node
// Deliberate allowlist: never copy local profiles, logs, drafts or SDK binaries.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../..');
const destination = process.argv[2];
if (!destination) throw new Error('Usage: node export-portable.mjs <new-output-directory>');
const out = path.resolve(destination);
if (fs.existsSync(out)) throw new Error('Output must be a new directory; existing files are never overwritten.');
const payload = spawnSync(process.execPath, [path.join(root, 'windows/scripts/injector.mjs'), '--check-payload', '--theme-dir', path.join(root, 'windows/assets')], { encoding: 'utf8' });
if (payload.status !== 0) throw new Error(`Theme validation failed: ${payload.stderr || payload.stdout}`);
const selected = ['Start-Dream-Skin.ps1', 'Start-Codex.ps1', 'README.md'];
function collect(directory, accept) {
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${relative}`);
    if (entry.isDirectory()) collect(relative, accept);
    else if (entry.isFile() && accept(relative)) selected.push(relative);
  }
}
collect('windows/scripts', p => /\.(ps1|mjs|cjs)$/.test(p));
collect('windows/assets', p => /\.(png|jpe?g|webp)$/.test(p) || /(?:^|\/)(theme\.json|selectors\.json|dream-skin\.css|renderer-inject\.js)$/.test(p));
collect('docs', p => /\.md$/.test(p) && !p.includes('/qa/'));
collect('modules', p => /\.(md|json)$/.test(p));
if (fs.existsSync(path.join(root, 'mimo'))) {
  collect('mimo', p => /\.(ps1|mjs|json|png|md)$/.test(p));
}
if (fs.existsSync(path.join(root, 'logo'))) collect('logo', p => /\.ico$/.test(p));
fs.mkdirSync(out, { recursive: true });
const files = [];
for (const relative of selected.sort()) {
  const data = fs.readFileSync(path.join(root, relative));
  const target = path.join(out, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
  files.push({ path: relative, bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex') });
}
fs.writeFileSync(path.join(out, 'portable-manifest.json'), JSON.stringify({ schema: 1, files }, null, 2) + '\n');
console.log(JSON.stringify({ directory: out, files: files.length, bytes: files.reduce((n, f) => n + f.bytes, 0), launcher: 'basic', node: 'external >=22 or windows/runtime/node/node.exe' }));
