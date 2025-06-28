import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Plugin } from 'release-it';

class ReleaseItPackageCleanPlugin extends Plugin {
  constructor() {
    super();
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.fieldsToRemove = ['devDependencies', 'scripts', 'workspaces', 'private'];
    this.originalPackageJson = null;
    this.newVersion = null;
  }

  async bump(version) {
    // Read the original package.json
    const originalContent = await readFile(this.packageJsonPath, 'utf8');
    this.originalPackageJson = JSON.parse(originalContent);
    this.newVersion = version;
  }

  async beforeRelease() {
    if (!this.originalPackageJson) {
      const originalContent = await readFile(this.packageJsonPath, 'utf8');
      this.originalPackageJson = JSON.parse(originalContent);
    }

    // Create a copy of the package.json without the specified fields
    const cleanPackageJson = { ...this.originalPackageJson };
    // Ensure the version is updated in the clean package.json
    cleanPackageJson.version = this.newVersion || cleanPackageJson.version;

    this.fieldsToRemove.forEach(field => {
      if (cleanPackageJson.hasOwnProperty(field)) {
        delete cleanPackageJson[field];
      }
    });

    // Write the clean package.json
    await writeFile(this.packageJsonPath, JSON.stringify(cleanPackageJson, null, 2));

    console.log('Cleaned package.json for publishing');
  }

  async release() {
    // Default release mechanism
    return true;
  }

  async afterRelease() {
    if (this.originalPackageJson) {
      // Restore the original package.json with the new version
      this.originalPackageJson.version = this.newVersion || this.originalPackageJson.version;

      // Write back the original package.json
      await writeFile(this.packageJsonPath, JSON.stringify(this.originalPackageJson, null, 2));

      console.log('Restored original package.json with new version');
    }
  }
}
