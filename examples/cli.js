#!/usr/bin/env node

import { parseArgs } from '../dist/index.js';

const config = {
  command: {
    name: 'serve',
    description: 'Start a server with the given options',
    positionals: [
      {
        name: 'input',
        description: 'serving files or directory',
        type: 'string',
        variadic: true, // 1 or more
        required: true,
      },
      {
        name: 'port',
        type: 'number',
        description: 'port to bind on',
        required: false,
        default: 5000, // optional default value
      },
    ],
  },
  options: {
    dryRun: {
      alias: 'd',
      type: 'boolean',
      description: 'Show what would be done, but do not actually start the server',
      default: false, // optional default value
    },
    exclude: {
      alias: 'e',
      type: 'array',
      description: 'pattern or glob to exclude (may be passed multiple times)',
    },
    rainbow: {
      type: 'boolean',
      alias: 'r',
      description: 'Enable rainbow mode',
      default: true,
    },
    verbose: {
      alias: 'V',
      type: 'boolean',
      description: 'print more information to console',
    },
    up: {
      type: 'number',
      description: 'slice a path off the bottom of the paths',
      default: 1,
    },
    display: {
      alias: 'D',
      required: true,
      type: 'boolean',
      description: 'a required display option',
    },
  },
  version: '0.1.6',
  helpOptLength: 18, // option name length shown in help (defaults to 20)
  helpDescLength: 60, // description length shown in help (defaults to 65)
};

const results = parseArgs(config);
console.log('Parsed arguments:', results);
