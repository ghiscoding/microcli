#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from '../dist/index.js';
import type { Config } from '../dist/interfaces.js';

function readPackage() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pkgPath = resolve(__dirname, '../package.json');
  const pkg = readFileSync(pkgPath, 'utf8');
  return JSON.parse(pkg);
}

const config: Config = {
  command: {
    name: 'copyfiles',
    description: 'Copy files from a source to a destination directory',
    positional: [
      {
        name: 'inFile',
        description: 'Source files',
        type: 'string',
        variadic: true,
        required: true,
      },
      {
        name: 'outDirectory',
        description: 'Destination directory',
        required: true,
      },
    ],
  },
  options: {
    all: {
      alias: 'a',
      type: 'boolean',
      description: 'Include files & directories begining with a dot (.)',
    },
    dryRun: {
      alias: 'd',
      type: 'boolean',
      description: 'Show what would be copied, but do not actually copy any files',
    },
    error: {
      alias: 'E',
      type: 'boolean',
      description: 'Throw error if nothing is copied',
    },
    exclude: {
      alias: 'e',
      type: 'array',
      description: 'Pattern or glob to exclude (may be passed multiple times)',
    },
    flat: {
      alias: 'f',
      type: 'boolean',
      description: 'Flatten the output',
    },
    follow: {
      alias: 'F',
      type: 'boolean',
      description: 'Follow symbolink links',
    },
    stat: {
      alias: 's',
      type: 'boolean',
      required: true,
      description: 'Show statistics after execution (execution time + file count)',
    },
    up: {
      type: 'number',
      description: 'Slice a path off the bottom of the paths',
    },
    verbose: {
      alias: 'V',
      type: 'boolean',
      description: 'Print more information to console',
    },
  },
  version: readPackage().version,
};

const results = parseArgs(config);
console.log('Parsed arguments:', results);
