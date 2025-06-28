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
    this.originalPackageJson = null;
  }

  async beforeRelease() {
    // Read the original package.json and store it
    const originalContent = await readFile(this.packageJsonPath, 'utf8');
    this.originalPackageJson = JSON.parse(originalContent);

    // Create a backup of package.json
    await copyFile(this.packageJsonPath, this.backupPackageJsonPath);

    // Remove specified fields using npm pkg
    for (let field of this.fieldsToRemove) {
      try {
        execSync(`npm pkg delete ${field}`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`Failed to remove ${field}:`, error);
      }
    }

    console.log('Cleaned package.json for publishing');
  }

  async release() {
    // Perform the actual npm publish using the default release-it mechanism
    return true;
  }

  async afterRelease() {
    try {
      // Restore the original package.json with the new version
      if (this.originalPackageJson) {
        const currentPackageJson = JSON.parse(await readFile(this.packageJsonPath, 'utf8'));
        this.originalPackageJson.version = currentPackageJson.version;

        // Write back the original package.json with updated version
        await writeFile(this.packageJsonPath, JSON.stringify(this.originalPackageJson, null, 2));
      }

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
