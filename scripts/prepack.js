import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const packageJsonPath = path.join(process.cwd(), 'package.json');
const backupPath = path.join(process.cwd(), 'package.json.bak');
const fieldsToRemove = ['devDependencies', 'scripts', 'workspaces', 'private'];

async function main() {
  // Backup the current package.json (with new version)
  await copyFile(packageJsonPath, backupPath);

  const content = await readFile(packageJsonPath, 'utf8');
  const pkg = JSON.parse(content);

  for (const field of fieldsToRemove) {
    delete pkg[field];
  }

  await writeFile(packageJsonPath, JSON.stringify(pkg, null, 2));
  console.log('prepack: Stripped dev fields from package.json for npm publish');
}

main();
