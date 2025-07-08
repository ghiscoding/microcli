#!/usr/bin/env node

import { parseArgs } from '../dist/index.js';

const config = {
  command: {
    name: 'serve',
    describe: 'Start a server with the given options',
    positionals: {
      input: {
        describe: 'serving files or directory',
        type: 'string',
        variadic: true, // 1 or more
        required: true,
      },
      port: {
        type: 'number',
        describe: 'port to bind on',
        required: false,
        default: 5000, // optional default value
      },
    },
  },
  options: {
    dryRun: {
      alias: 'd',
      type: 'boolean',
      describe: 'Show what would be done, but do not actually start the server',
      default: false, // optional default value
    },
    display: {
      group: 'Advanced Options',
      alias: 'D',
      required: true,
      type: 'boolean',
      describe: 'a required display option',
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
    open: {
      alias: 'o',
      type: 'boolean',
      describe: 'open browser when starting server',
      default: true,
    },
    cache: {
      type: 'number',
      describe: 'Set cache time (in seconds) for cache-control max-age header',
      default: 3600,
    },
    address: {
      type: 'string',
      describe: 'Address to use',
      required: true,
    },
    rainbow: {
      group: 'Advanced Options',
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
