[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/tested%20with-vitest-fcc72b.svg?logo=vitest)](https://vitest.dev/)
[![codecov](https://codecov.io/gh/ghiscoding/cli-nano/branch/main/graph/badge.svg)](https://codecov.io/gh/ghiscoding/cli-nano)
[![npm](https://img.shields.io/npm/v/cli-nano.svg)](https://www.npmjs.com/package/cli-nano)
[![npm](https://img.shields.io/npm/dy/cli-nano)](https://www.npmjs.com/package/cli-nano)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/cli-nano?color=success&label=gzip)](https://bundlephobia.com/result?p=cli-nano)
<a href="https://nodejs.org/en/about/previous-releases"><img src="https://img.shields.io/node/v/cli-nano.svg" alt="Node" /></a>

## cli-nano

Simple library to create command-line tool (aka CLI) which is quite similar to [`Yargs`](https://github.com/yargs/yargs), it is as configurable as Yargs but is a fraction of its size. The library is also inspired by NodeJS `parseArgs()` but is again more configurable so that we really get what we would expect from a more complete CLI builder.

### Features
- Parses arguments
- Supports defining Positional arguments 
  - Supports Variadic args (1 or more positional args)
- Automatically converts flags to camelCase to match config options
  - accepts both `--camelCase` and `--kebab-case`
- Negates flags when using the `--no-` prefix
- Outputs version, when defined, by using `--version`
- Outputs description and supplied help text by using `--help`
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
    }
  },
  version: '0.1.6',
  helpOptLength: 18,  // option name length shown in help (defaults to 20)
  helpDescLength: 60, // description length shown in help (defaults to 65)
};

const args = parseArgs(config);
console.log(args);

// do something with parse arguments, for example
// startServer(args);
```

### Usage with Type Inference

For full TypeScript auto-inference and IntelliSense of parsed arguments, define your config as a `const` and use `as const`:

```ts
const config = {
  ... // your config object as shown above
} as const;

const args = parseArgs<typeof config>(config);

// TypeScript will infer the correct types:
args.input;   // [string, ...string[]] (required, variadic)
args.port;    // number   (optional, has default)
args.verbose; // boolean  (optional)
args.display; // boolean (required)
```

> **Tip:**  
> Using `as const` preserves literal types and tuple information, so TypeScript can infer required/optional fields and argument types automatically.  
> If you use `const config: Config = { ... }`, you get type checking but not full IntelliSense for parsed arguments.

> [!NOTE]
> For required+variadic positionals, the type is `[string, ...string[]]` (at least one value required). For optional variadic, it's string[]. For non-variadic, it's string.

#### Example CLI Calls

```sh
# Show help guide (created by reading CLI config)
serve --help

# Show version (when defined)
serve --version

# Uses default port 5000
serve dist/index.html

# With required and optional positionals
serve index1.html index2.html 8080 -D value

# With boolean and array options
serve index.html 7000 --dryRun --exclude pattern1 --exclude pattern2 -D value

# With negated boolean
serve index.html 7000 --no-dryRun -D value

# With short aliases
serve index.html 7000 -d -e pattern1 -e pattern2 -D value

# With number option
serve index.html 7000 --up 2 -D value
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

## Used by

`cli-nano` is currently used in these other projects of mine (feel free to edit this list):

- [native-copyfiles](https://github.com/ghiscoding/native-copyfiles)
- [remove-glob](https://github.com/ghiscoding/remove-glob)

## Help Example

You can see below an example of a CLI help (which is the result of calling `--help` with the config shown avove). 

Please note:

- `<option>` → required
- `[option]` → optional

```
Usage:
  serve <input..> [port] [options]  Start a server with the given options

Arguments:
  input             serving files or directory                                        <string..>
  port              port to bind on                                                   [number]

Options:
  -d, --dryRun      Show what would be done, but do not actually start the server     [boolean]
  -e, --exclude     pattern or glob to exclude (may be passed multiple times)         [array]
  -r, --rainbow     Enable rainbow mode                                               [boolean]
  -V, --verbose     print more information to console                                 [boolean]
      --up          slice a path off the bottom of the paths                          [number]
  -D, --display     a required display option                                         <boolean>
  -h, --help        Show help                                                         [boolean]
  -v, --version     Show version number                                               [boolean]
```