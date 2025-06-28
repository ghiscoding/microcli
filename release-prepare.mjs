import { execSync } from 'node:child_process';
import { copyFile, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Plugin } from 'release-it';

class ReleaseItPackageCleanPlugin extends Plugin {
  constructor() {
    super();
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.backupPackageJsonPath = path.join(process.cwd(), 'package.json.backup');
    this.fieldsToRemove = ['devDependencies', 'scripts', 'workspaces', 'private'];
    this.newVersion = null;
  }

  // Capture the new version during the bump phase
  async bump(version) {
    this.newVersion = version;
  }

  async beforeRelease() {
    // Create a backup of package.json
    await copyFile(this.packageJsonPath, this.backupPackageJsonPath);

    // Remove specified fields using npm pkg
    for (const field of this.fieldsToRemove) {
      try {
        execSync(`npm pkg delete ${field}`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`Failed to remove ${field}:`, error);
      }
    }

    console.log('Cleaned package.json for publishing');
  }

  async afterRelease() {
    try {
      // Read the backup file
      const backupContent = await readFile(this.backupPackageJsonPath, 'utf8');
      const backupPackageJson = JSON.parse(backupContent);

      // Update the version in the original package.json
      if (this.newVersion) {
        backupPackageJson.version = this.newVersion;
      }

      // Write back the original package.json with updated version
      await writeFile(this.packageJsonPath, JSON.stringify(backupPackageJson, null, 2));

      // Remove the backup file
      await unlink(this.backupPackageJsonPath);

      console.log('Restored original package.json with new version');
    } catch (error) {
      console.error('Error in afterRelease:', error);
      throw error;
    }
  }
}

export default ReleaseItPackageCleanPlugin;
