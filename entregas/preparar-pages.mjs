import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(directory, '../docs');

for (const name of ['linktree', 'carta-web']) {
  const source = path.join(directory, name);
  const destination = path.join(output, name);
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.isFile() && /\.(html|css|js)$/.test(entry.name)) {
      fs.copyFileSync(path.join(source, entry.name), path.join(destination, entry.name));
    }
  }
  fs.cpSync(path.join(source, 'assets'), path.join(destination, 'assets'), { recursive: true });
  console.log(`GitHub Pages: docs/${name}/ actualizado.`);
}