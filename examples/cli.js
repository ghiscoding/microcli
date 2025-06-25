#!/usr/bin/env node

import { parseArgs } from '../dist/index.js';

const config = {
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
  version: '0.1.6',
};

const results = parseArgs(config);
console.log('Parsed arguments:', results);
