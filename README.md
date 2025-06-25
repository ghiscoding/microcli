[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/tested%20with-vitest-fcc72b.svg?logo=vitest)](https://vitest.dev/)
[![codecov](https://codecov.io/gh/ghiscoding/microcli/branch/main/graph/badge.svg)](https://codecov.io/gh/ghiscoding/microcli)
[![npm](https://img.shields.io/npm/v/microcli.svg)](https://www.npmjs.com/package/microcli)
[![npm](https://img.shields.io/npm/dy/microcli)](https://www.npmjs.com/package/microcli)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/microcli?color=success&label=gzip)](https://bundlephobia.com/result?p=microcli)

## microcli

Super small custom CLI similar to `Yargs` but much smaller, it uses a similar approach to NodeJS `parseArgs()` to create command-line tool (aka CLI). It is much more complete than NodeJS `parseArgs()` since it supports Positional Arguments, negated flags and also accepts both syntax `--camelCase` and/or `--kebab-case`.

### Features
- Parses arguments
- Converts flags to camelCase
- Negates flags when using the `--no-` prefix
- Outputs version when `--version`
- Outputs description and supplied help text when `--help`
- No dependencies!

### Install
```sh
npm install microcli
```

### Usage

```ts
#!/usr/bin/env node

import { type Config, parseArgs } from 'microcli';

const config: Config = {
  command: {
    name: 'unicorns',
    description: 'Show a list of unicorns',
    positional: [
      {
        name: 'inputs',
        description: 'unicorn inputs',
        type: 'string',
        variadic: true, // one or more inputs could be provided
        required: true,
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
      description: 'Show what would be copied, but do not actually copy any files',
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
    },
    verbose: {
      alias: 'V',
      type: 'boolean',
      description: 'print more information to console',
    },
    up: {
      type: 'number',
      description: 'slice a path off the bottom of the paths',
    },
    bar: {
      alias: 'b',
      required: true,
      description: 'a required bar option',
    }
  },
  version: '0.1.6',
};

const argv = parseArgs(config);
console.log(argv);
```

#### Example CLI Calls

```sh
# Show help
unicorns --help

# Show version
unicorns --version

# With required and optional positionals
unicorns file1.txt file2.txt output/ -b value

# With boolean and array options
unicorns file1.txt output/ --dryRun --exclude pattern1 --exclude pattern2 -b value

# With negated boolean
unicorns file1.txt output/ --no-dryRun -b value

# With short aliases
unicorns file1.txt output/ -d -e pattern1 -e pattern2 -b value

# With number option
unicorns file1.txt output/ --up 2 -b value
```

#### Notes

- **Variadic positionals**: Use `variadic: true` for arguments that accept multiple values.
- **Required options**: Add `required: true` to enforce presence of an option.
- **Negated booleans**: Use `--no-flag` to set a boolean option to `false`.
- **Array options**: Repeat the flag to collect multiple values (e.g., `--exclude a --exclude b`).
- **Aliases**: Use `alias` for short flags (e.g., `-d` for `--dryRun`).

See [examples/](examples/) for more usage patterns.