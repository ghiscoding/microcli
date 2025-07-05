import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { parseArgs } from '../index.js';
import type { Config } from '../interfaces.js';

const config: Config = {
  command: {
    name: 'copyfiles',
    description: 'Copy files from a source to a destination directory',
    positionals: [
      {
        name: 'inFile',
        description: 'source files',
        type: 'string',
        required: true,
      },
      {
        name: 'outDirectory',
        description: 'destination directory',
        required: true,
      },
    ],
  },
  options: {
    all: {
      alias: 'a',
      type: 'boolean',
      description: 'include files & directories begining with a dot (.)',
    },
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
    up: {
      type: 'number',
      description: 'slice a path off the bottom of the paths',
    },
    bar: {
      alias: 'b',
      required: true,
      description: 'a required bar option',
    },
  },
  version: '0.1.6',
};

describe('parseArgs', () => {
  beforeEach(() => {
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...[]]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should parse positional arguments correctly', () => {
    const args = ['file1.txt', 'output/', '--bar', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);

    const result = parseArgs(config);

    expect(result.inFile).toBe('file1.txt');
    expect(result.outDirectory).toBe('output/');
  });

  it('should parse camelCase boolean options correctly', () => {
    const args = ['file1.txt', 'output/', '--all', '--no-dryRun', '--bar', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);

    const result = parseArgs(config);

    expect(result.inFile).toBe('file1.txt');
    expect(result.outDirectory).toBe('output/');
    expect(result.all).toBe(true);
    expect(result.dryRun).toBe(false);
  });

  it('should parse kebab-case boolean options correctly', () => {
    const args = ['file1.txt', 'output/', '--all', '--no-dry-run', '--bar', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);

    const result = parseArgs(config);

    expect(result.inFile).toBe('file1.txt');
    expect(result.outDirectory).toBe('output/');
    expect(result.all).toBe(true);
    expect(result.dryRun).toBe(false);
  });

  it('should match option alias using kebab/camel transformations for a single alias', () => {
    const config = {
      command: {
        name: 'test',
        description: '',
        positionals: [],
      },
      options: {
        fooBar: { type: 'boolean', alias: 'foo-bar', description: '' },
        bazQux: { type: 'boolean', alias: 'bazQux', description: '' },
      },
      version: '1.0.0',
    } as const;

    // Should match the kebab-case alias
    let args = ['--foo-bar'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    let result = parseArgs(config);
    expect(result.fooBar).toBe(true);

    // Should match the camelCase alias
    args = ['--bazQux'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    result = parseArgs(config);
    expect(result.bazQux).toBe(true);

    // Should match the kebab-case alias with camelCase argument
    args = ['--fooBar'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    result = parseArgs(config);
    expect(result.fooBar).toBe(true);

    // Should match the camelCase alias with kebab-case argument
    args = ['--baz-qux'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    result = parseArgs(config);
    expect(result.bazQux).toBe(true);
  });

  it('should parse string options correctly', () => {
    const args = ['file1.txt', 'output/', '--up', '2', '--bar', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(config);
    expect(result.up).toBe(2);
  });

  it('should parse string options correctly with an alias', () => {
    const args = ['file1.txt', 'output/', '--up', '2', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(config);
    expect(result.up).toBe(2);
    expect(result.bar).toBe('value');
  });

  it('should parse array options correctly when defined at the end of the command options', () => {
    const args = ['file1.txt', 'output/', '-b', 'value', '--exclude', 'pattern1', '--exclude', 'pattern2'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(config);
    expect(result.exclude).toEqual(['pattern1', 'pattern2']);
    expect(result.bar).toBe('value');
  });

  it('should parse array options correctly when defined in the middle of the command options with camelCase arguments', () => {
    const args = ['file1.txt', 'output/', '--exclude', 'pattern1', '--exclude', 'pattern2', '-b', 'value', '--dryRun'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(config);
    expect(result.exclude).toEqual(['pattern1', 'pattern2']);
    expect(result.dryRun).toBe(true);
    expect(result.bar).toBe('value');
  });

  it('should parse array options correctly when defined in the middle of the command options with kebab-case arguments', () => {
    const args = ['file1.txt', 'output/', '--exclude', 'pattern1', '--exclude', 'pattern2', '-b', 'value', '--dry-run'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(config);
    expect(result.exclude).toEqual(['pattern1', 'pattern2']);
    expect(result.dryRun).toBe(true);
    expect(result.bar).toBe('value');
  });

  it('should throw an error for unknown options', () => {
    const args = ['file1.txt', 'output/', '-b', 'value', '--unknown'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrowError('Unknown CLI option: unknown');
  });

  it('should throw an error for unknown kebab-case options', () => {
    const args = ['file1.txt', 'output/', '-b', 'value', '--unknown-kebab'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrowError('Unknown CLI option: unknown-kebab');
  });

  it('should throw an error for unknown camelCase options', () => {
    const args = ['file1.txt', 'output/', '-b', 'value', '--unknownCamel'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrowError('Unknown CLI option: unknownCamel');
  });

  it('should throw when truthy and --no camelCase prefix arguments are both provided', () => {
    const args = ['file1.txt', 'output/', '--all', '--dryRun', '--no-dryRun', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrowError('Providing same negated and truthy argument are not allowed');
  });

  it('should throw when truthy and --no kebab-case prefix arguments are both provided', () => {
    const args = ['file1.txt', 'output/', '--all', '--dryRun', '--no-dry-run', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrowError('Providing same negated and truthy argument are not allowed');
  });

  it('should throw when --no prefix and truthy arguments are both provided', () => {
    const args = ['file1.txt', 'output/', '--all', '--no-dryRun', '--dryRun', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrowError('Providing same negated and truthy argument are not allowed');
  });

  it('should throw when positional arguments are missing', () => {
    const args = ['file1.txt', '--all', '--dryRun'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);

    expect(() => parseArgs(config)).toThrow('Missing required positional argument, i.e.: "copyfiles <inFile> <outDirectory>');
  });

  it('should throw when positional arguments are missing and it will not try to read "value" as positional argument either', () => {
    const args = ['file1.txt', '--all', '--dryRun', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);

    expect(() => parseArgs(config)).toThrow('Missing required positional argument, i.e.: "copyfiles <inFile> <outDirectory>');
  });

  it('should throw when required options are missing', () => {
    const args = ['file1.txt', 'output', '--all', '--dryRun'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);

    expect(() => parseArgs(config)).toThrow('Missing required option: -b, --bar');
  });

  it('should throw if the same alias is defined for multiple options', () => {
    const configWithDupAlias: Config = {
      ...config,
      options: {
        foo: { alias: 'x', type: 'boolean', description: '' },
        bar: { alias: 'x', type: 'boolean', description: '' },
      },
    };
    expect(() => parseArgs(configWithDupAlias)).toThrow('Duplicate alias detected: "x" used for both "foo" and "bar"');
  });

  it('should handle help command', () =>
    new Promise((done: any) => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const args = ['--help'];
      vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
      try {
        parseArgs(config);
      } catch (error: any) {
        expect(error.message).toBe('process.exit unexpectedly called with "0"');
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('copyfiles <inFile> <outDirectory> [options]  Copy files from a source to a destination directory'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('\nPositionals:'));
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('  inFile              source files                                                      [string]'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('  -d, --dryRun        Show what would be copied, but do not actually copy any files     [boolean]'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            '  -b, --bar           a required bar option                                             [string][required]',
          ),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('\nDefault options:'));
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('  -h, --help          Show help                                                         [boolean]'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('  -v, --version       Show version number                                               [boolean]'),
        );
        done();
      }
    }));

  it('should truncate long descriptions with ellipsis in help output', () =>
    new Promise((done: any) => {
      const longDesc =
        'This is a very long description that should be truncated with an ellipsis if it exceeds the maximum allowed length for display in the help output. It keeps going and going and going...';
      const configWithLongDesc: Config = {
        ...config,
        options: {
          ...config.options,
          longdesc: {
            alias: 'l',
            type: 'boolean',
            description: longDesc,
          },
        },
      };
      config.command.positionals![0].variadic = true;
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const args = ['--help'];
      vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
      try {
        parseArgs(configWithLongDesc);
      } catch {
        // The truncated string should end with '...'
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('  inFile              source files                                                      [string..]'),
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('  -l, --longdesc      This is a very long description that should be truncated with ... [boolean]'),
        );
        delete config.command.positionals![0].variadic;
        done();
      }
    }));

  it('should handle version command', () =>
    new Promise((done: any) => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const args = ['--version'];
      vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
      try {
        parseArgs(config);
      } catch (error: any) {
        expect(error.message).toBe('process.exit unexpectedly called with "0"');
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('0.1.6'));
        done();
      }
    }));

  it('should parse optional variadic positional arguments (zero or more)', () => {
    const config: Config = {
      command: {
        name: 'test',
        description: 'Test optional variadic',
        positionals: [
          {
            name: 'outDir',
            description: 'output directory',
            required: true,
          },
          {
            name: 'inputs',
            description: 'input files',
            type: 'string',
            variadic: true,
            required: false,
          },
        ],
      },
      options: {},
      version: '1.0.0',
    };
    // No inputs
    let args = ['dist'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    let result = parseArgs(config);
    expect(result.outDir).toBe('dist');
    expect(result.inputs).toEqual([]);
    // Multiple inputs
    args = ['dist', 'file1', 'file2'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    result = parseArgs(config);
    expect(result.outDir).toBe('dist');
    expect(result.inputs).toEqual(['file1', 'file2']);
  });

  it('should parse a single optional variadic positional arguments (zero or more)', () => {
    const config: Config = {
      command: {
        name: 'test',
        description: 'Test optional variadic',
        positionals: [
          {
            name: 'inputs',
            description: 'input files',
            type: 'string',
            variadic: true,
            required: true,
          },
        ],
      },
      options: {},
      version: '1.0.0',
    };
    // No inputs
    let args: string[] = [];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrow('Missing required positional argument, i.e.: "test <inputs..>');

    // Multiple inputs
    args = ['file1', 'file2'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(config);
    expect(result.inputs).toEqual(['file1', 'file2']);
  });

  it('should print usage with required variadic positional argument using <inFile..>', () => {
    const configWithVariadic: Config = {
      ...config,
      command: {
        ...config.command,
        positionals: [
          {
            name: 'inFile',
            description: 'source files',
            type: 'string',
            variadic: true,
            required: true,
          },
          {
            name: 'outDirectory',
            description: 'destination directory',
            required: true,
          },
        ],
      },
    };
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', '--help']);
    try {
      parseArgs(configWithVariadic);
    } catch {}
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('<inFile..>'));
    spy.mockRestore();
  });

  it('should print usage without any positional argument defined', () => {
    const configWithoutPositional: Config = {
      ...config,
      command: {
        ...config.command,
      },
      options: {
        file: {
          description: 'source files',
          type: 'string',
        },
      },
    };
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', '--help']);
    try {
      parseArgs(configWithoutPositional);
    } catch {}
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('--file'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('source files'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[string]'));
    spy.mockRestore();
  });

  it('should throw if required boolean flag is missing', () => {
    const config: Config = {
      command: {
        name: 'test',
        description: 'Test required flag',
      },
      options: {
        force: {
          alias: 'f',
          type: 'boolean',
          required: true,
          description: 'Force operation',
        },
      },
      version: '1.0.0',
    };
    const args: string[] = [];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrow('Missing required option: -f, --force');
  });

  it('should parse kebab-case long option when alias is camelCase', () => {
    const configWithCamelAlias: Config = {
      ...config,
      options: {
        ...config.options,
        testOption: {
          alias: 'testAliasCamel',
          type: 'boolean',
          description: 'A test option with camelCase alias',
        },
      },
    };
    const args = ['file1.txt', 'output/', '--test-alias-camel', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithCamelAlias);
    expect(result.testOption).toBe(true);
  });

  it('should parse camelCase long option when alias is kebab-case', () => {
    const configWithKebabAlias: Config = {
      ...config,
      options: {
        ...config.options,
        testOption: {
          alias: 'test-alias-kebab',
          type: 'boolean',
          description: 'A test option with kebab-case alias',
        },
      },
    };
    const args = ['file1.txt', 'output/', '--testAliasKebab', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithKebabAlias);
    expect(result.testOption).toBe(true);
  });

  it('should throw if too many positional arguments are provided', () => {
    const args = ['file1.txt', 'output/', 'extra.txt', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrow('Unknown argument: extra.txt');
  });

  it('should throw if array option is missing a value', () => {
    const args = ['file1.txt', 'output/', '--exclude', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrow('Missing value for array option: exclude');
  });

  it('should throw if string option is missing a value', () => {
    const args = ['file1.txt', 'output/', '--bar'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrow('Missing value for option: bar');
  });

  it('should throw if number option is missing a value', () => {
    const args = ['file1.txt', 'output/', '--up'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(config)).toThrow('Missing value for option: up');
  });

  it('should throw unknown option when short flag does not match any alias', () => {
    const configWithNoAlias: Config = {
      ...config,
      options: {
        ...config.options,
        noAliasOpt: {
          type: 'boolean',
          description: 'Option with no alias',
        },
      },
    };
    const args = ['file1.txt', 'output/', '-x', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    expect(() => parseArgs(configWithNoAlias)).toThrow('Unknown CLI option: x');
  });

  it('should print usage with optional positional argument', () => {
    const configWithOptional: Config = {
      ...config,
      command: {
        ...config.command,
        positionals: [
          {
            name: 'inFile',
            description: 'source files',
            type: 'string',
            required: false, // <-- optional positional
          },
          {
            name: 'outDirectory',
            description: 'destination directory',
            required: true,
          },
        ],
      },
    };
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', '--help']);
    try {
      parseArgs(configWithOptional);
    } catch {}
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('[inFile]'));
    spy.mockRestore();
  });

  it('should use default value for optional positional argument when not provided', () => {
    const configWithDefaultPositional: Config = {
      command: {
        name: 'test',
        description: 'Test default positional',
        positionals: [
          {
            name: 'outDir',
            description: 'output directory',
            required: true,
          },
          {
            name: 'input',
            description: 'input file',
            type: 'string',
            required: false,
            default: 'default.txt',
          },
        ],
      },
      options: {},
      version: '1.0.0',
    };
    const args = ['dist'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithDefaultPositional);
    expect(result.outDir).toBe('dist');
    expect(result.input).toBe('default.txt');
  });

  it('should throw if required positional comes after optional positional', () => {
    const configInvalid: Config = {
      command: {
        name: 'badcli',
        description: 'Invalid CLI',
        positionals: [
          { name: 'foo', description: '', required: false },
          { name: 'bar', description: '', required: true },
        ],
      },
      options: {},
      version: '1.0.0',
    };
    expect(() => parseArgs(configInvalid)).toThrow(
      'Invalid positional argument configuration: required positional "bar" cannot follow optional positional(s).',
    );
  });

  it('should use default value for optional variadic positional argument when not provided', () => {
    const configWithDefaultVariadic: Config = {
      command: {
        name: 'test',
        description: 'Test default variadic positional',
        positionals: [
          {
            name: 'outDir',
            description: 'output directory',
            required: true,
          },
          {
            name: 'inputs',
            description: 'input files',
            type: 'string',
            variadic: true,
            required: false,
            default: ['default1.txt', 'default2.txt'],
          },
        ],
      },
      options: {},
      version: '1.0.0',
    };
    const args = ['dist'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithDefaultVariadic);
    expect(result.outDir).toBe('dist');
    expect(result.inputs).toEqual(['default1.txt', 'default2.txt']);
  });

  it('should not use default value for option if value is provided', () => {
    const configWithDefault: Config = {
      ...config,
      options: {
        ...config.options,
        file: {
          alias: 'f',
          type: 'string',
          description: 'File path',
          default: '/etc/passwd',
        },
        bar: {
          alias: 'b',
          required: true,
          description: 'a required bar option',
        },
      },
    };
    const args = ['file1.txt', 'output/', '--file', '/tmp/override', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithDefault);
    expect(result.file).toBe('/tmp/override');
  });

  it('should use default value for option with alias when not provided', () => {
    const configWithDefault: Config = {
      ...config,
      options: {
        ...config.options,
        verbose: {
          alias: 'V',
          type: 'boolean',
          description: 'Print more information',
          default: true,
        },
        bar: {
          alias: 'b',
          required: true,
          description: 'a required bar option',
        },
      },
    };
    const args = ['file1.txt', 'output/', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithDefault);
    expect(result.verbose).toBe(true);
  });

  it('should use default value for boolean option when not provided', () => {
    const configWithDefault: Config = {
      ...config,
      options: {
        ...config.options,
        follow: {
          alias: 'F',
          type: 'boolean',
          description: 'Follow symbolic links',
          default: true,
        },
        bar: {
          alias: 'b',
          required: true,
          description: 'a required bar option',
        },
      },
    };
    const args = ['file1.txt', 'output/', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithDefault);
    expect(result.follow).toBe(true);
  });

  it('should use default value for string option when not provided', () => {
    const configWithDefault: Config = {
      ...config,
      options: {
        ...config.options,
        file: {
          alias: 'f',
          type: 'string',
          description: 'File path',
          default: '/etc/passwd',
        },
        bar: {
          alias: 'b',
          required: true,
          description: 'a required bar option',
        },
      },
    };
    const args = ['file1.txt', 'output/', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithDefault);
    expect(result.file).toBe('/etc/passwd');
  });

  it('should use default value for number option when not provided', () => {
    const configWithDefault: Config = {
      ...config,
      options: {
        ...config.options,
        up: {
          type: 'number',
          description: 'slice a path off the bottom of the paths',
          default: 5,
        },
        bar: {
          alias: 'b',
          required: true,
          description: 'a required bar option',
        },
      },
    };
    const args = ['file1.txt', 'output/', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithDefault);
    expect(result.up).toBe(5);
  });

  it('should use default value for array option when not provided', () => {
    const configWithDefault: Config = {
      ...config,
      options: {
        ...config.options,
        exclude: {
          alias: 'e',
          type: 'array',
          description: 'pattern or glob to exclude',
          default: ['node_modules', 'dist'],
        },
        bar: {
          alias: 'b',
          required: true,
          description: 'a required bar option',
        },
      },
    };
    const args = ['file1.txt', 'output/', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithDefault);
    expect(result.exclude).toEqual(['node_modules', 'dist']);
  });

  it('should override default value when option is provided', () => {
    const configWithDefault: Config = {
      ...config,
      options: {
        ...config.options,
        follow: {
          alias: 'F',
          type: 'boolean',
          description: 'Follow symbolic links',
          default: false,
        },
        bar: {
          alias: 'b',
          required: true,
          description: 'a required bar option',
        },
      },
    };
    const args = ['file1.txt', 'output/', '--follow', '-b', 'value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(configWithDefault);
    expect(result.follow).toBe(true);
  });

  it('should parse options passed with = (equals sign)', () => {
    const args = ['file1.txt', 'output/', '--exclude=pattern1', '-e=pattern2', '--bar=value'];
    vi.spyOn(process, 'argv', 'get').mockReturnValue(['node', 'cli.js', ...args]);
    const result = parseArgs(config);
    expect(result.exclude).toEqual(['pattern1', 'pattern2']);
    expect(result.bar).toBe('value');
  });
});
