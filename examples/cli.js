#!/usr/bin/env node

import { parseArgs } from '../dist/index.js';

const config = {
  command: {
    name: 'serve',
    describe: 'Start a server with the given options',
    positionals: [
      {
        name: 'input',
        describe: 'serving files or directory',
        type: 'string',
        variadic: true, // 1 or more
        required: true,
      },
      {
        name: 'port',
        type: 'number',
        describe: 'port to bind on',
        required: false,
        default: 5000, // optional default value
      },
    ],
  },
  options: {
    dryRun: {
      alias: 'd',
      type: 'boolean',
      describe: 'Show what would be done, but do not actually start the server',
      default: false, // optional default value
    },
    exclude: {
      alias: 'e',
      type: 'array',
      describe: 'pattern or glob to exclude (may be passed multiple times)',
    },
    verbose: {
      alias: 'V',
      type: 'boolean',
      describe: 'print more information to console',
    },
    up: {
      type: 'number',
      describe: 'slice a path off the bottom of the paths',
      default: 1,
    },
    display: {
      // group: 'Other Options',
      alias: 'D',
      required: true,
      type: 'boolean',
      describe: 'a required display option',
    },
    rainbow: {
      // group: 'Other Options',
      type: 'boolean',
      alias: 'r',
      describe: 'Enable rainbow mode',
      default: true,
    },
  },
  version: '0.1.6',
  maxDescLength: 125, // max description length shown in help
};

const results = parseArgs(config);
console.log('Parsed arguments:', results);
