[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/tested%20with-vitest-fcc72b.svg?logo=vitest)](https://vitest.dev/)
[![codecov](https://codecov.io/gh/ghiscoding/cli-nano/branch/main/graph/badge.svg)](https://codecov.io/gh/ghiscoding/cli-nano)
[![npm](https://img.shields.io/npm/v/cli-nano.svg)](https://www.npmjs.com/package/cli-nano)
[![npm](https://img.shields.io/npm/dy/cli-nano)](https://www.npmjs.com/package/cli-nano)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/cli-nano?color=success&label=gzip)](https://bundlephobia.com/result?p=cli-nano)

## cli-nano

Super small custom CLI similar to `Yargs` but much smaller, it uses a similar approach to NodeJS `parseArgs()` to create command-line tool (aka CLI). It is much more complete than NodeJS `parseArgs()` since it supports Positional Arguments, negated flags and also accepts both syntax `--camelCase` and/or `--kebab-case`.

### Features
- Parses arguments
- Converts flags to camelCase
- Negates flags when using the `--no-` prefix
- Outputs version when `--version`
- Outputs description and supplied help text when `--help`
- Supports defining `required` options
- Supports `default` values
- No dependencies!

### Install
```sh
npm install cli-nano
```

### Usage

```ts
#!/usr/bin/env node

import { type Config, parseArgs } from 'cli-nano';

const config: Config = {
  command: {
    name: 'serve',
    description: 'Start a server with the given options',
    positional: [
      {
        name: 'port',
        type: 'number',
        description: 'port to bind on',
        required: false,
        default: 5000, // optional default value for positional
      },
      {
        name: 'output',
        description: 'output directory',
        type: 'string',
        required: false,
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
    bar: {
      alias: 'b',
      required: true,
      description: 'a required bar option',
    }
  },
  version: '0.1.6',
};

const args = parseArgs(config);
console.log(args);

// do something with parse arguments, for example
// startServer(args);
```

#### Example CLI Calls

```sh
# Show help
serve --help

# Show version
serve --version

# Uses default port 5000
serve output/

# With required and optional positionals
serve file1.html file2.html output/ -b value

# With boolean and array options
serve file1.html output/ --dryRun --exclude pattern1 --exclude pattern2 -b value

# With negated boolean
serve file1.html output/ --no-dryRun -b value

# With short aliases
serve file1.html output/ -d -e pattern1 -e pattern2 -b value

# With number option
serve file1.html output/ --up 2 -b value
```

#### Notes

- **Default values**: Use the `default` property in an option or positional argument to specify a value if the user does not provide one.
  - Example for option: `{ type: 'boolean', default: false }`
  - Example for positional: `{ name: 'port', type: 'number', default: 5000 }`
- **Variadic positionals**: Use `variadic: true` for arguments that accept multiple values.
- **Required options**: Add `required: true` to enforce presence of an option.
- **Negated booleans**: Use `--no-flag` to set a boolean option to `false`.
- **Array options**: Repeat the flag to collect multiple values (e.g., `--exclude a --exclude b`).
- **Aliases**: Use `alias` for short flags (e.g., `-d` for `--dryRun`).

See [examples/](examples/) for more usage patterns.