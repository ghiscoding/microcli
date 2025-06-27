// release-prepare.mjs

import { readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Plugin } from 'release-it';

class ReleaseItPackageCleanPlugin extends Plugin {
  constructor() {
    super();
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.backupPackageJsonPath = path.join(process.cwd(), 'package.json.backup');
    this.originalPackageJson = null;
    this.newVersion = null;
  }

  async beforeRelease() {
    // Read original package.json
    const originalContent = await readFile(this.packageJsonPath, 'utf8');
    const originalPackageJson = JSON.parse(originalContent);

    // Store original content for restoration
    this.originalPackageJson = originalContent;

    // Create backup
    await writeFile(this.backupPackageJsonPath, originalContent);

    // Modify package.json
    const packageJson = { ...originalPackageJson };

    const fieldsToRemove = ['devDependencies', 'scripts', 'workspaces', 'private'];

    fieldsToRemove.forEach(field => delete packageJson[field]);

    // Write modified package.json
    await writeFile(this.packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log('Created backup and cleaned package.json for publishing');
  }

  async afterRelease() {
    // Restore original package.json from backup
    if (this.originalPackageJson) {
      const backupContent = await readFile(this.backupPackageJsonPath, 'utf8');
      const backupPackageJson = JSON.parse(backupContent);
      const currentPackageJson = JSON.parse(await readFile(this.packageJsonPath, 'utf8'));

      // Update version in the backup package.json to match the new version
      backupPackageJson.version = currentPackageJson.version;

      // Write back the updated backup content
      await writeFile(this.packageJsonPath, JSON.stringify(backupPackageJson, null, 2));

      // Remove backup file
      await unlink(this.backupPackageJsonPath);

      console.log('Restored and updated package.json with new version');
    }
  }
}

export default ReleaseItPackageCleanPlugin;
