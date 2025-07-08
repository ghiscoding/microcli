export interface FlagOption {
  /** option type */
  type?: 'string' | 'boolean' | 'number' | 'array';

  /** describe the flag option */
  describe: string;

  /** defaults to undefined, provide shorter alias as command options */
  alias?: string;

  /** default value for the option if not provided */
  default?: any;

  /** optional group for grouping some commands */
  group?: string;

  /** defaults to false, is the option required? */
  required?: boolean;
}

export interface PositionalArgument {
  /** describe positional argument */
  describe: string;

  /** postional argument type */
  type?: 'string' | 'boolean' | 'number' | 'array';

  /** defaults to false, allows multiple values for this positional argument */
  variadic?: boolean;

  /** default value for the option if not provided */
  default?: any;

  /** defaults to false, is the positional argument required? */
  required?: boolean;
}

export interface CommandOption {
  /** command name, used in the help docs */
  name: string;

  /** describe command */
  describe: string;

  /** list of positional arguments */
  positionals?: Record<string, PositionalArgument>;
}

/** CLI options */
export interface Config {
  /** CLI definition */
  command: CommandOption;

  /** min description length shown in the help (defaults to 50) */
  minHelpDescLength?: number;

  /** max description length shown in the help (defaults to 100) */
  maxHelpDescLength?: number;

  /** CLI list of flag options */
  options: Record<string, FlagOption>;

  /** CLI or package version */
  version?: string;
}

/** Utility type to map ArgumentOptions/PositionalArgument to their value type */
export type ArgValueType<T extends { type?: string; default?: any; variadic?: boolean; required?: boolean }> = T['type'] extends 'boolean'
  ? boolean
  : T['type'] extends 'number'
    ? number
    : T['type'] extends 'array'
      ? T extends { variadic: true }
        ? T extends { required: true }
          ? [string, ...string[]]
          : string[]
        : string | string[]
      : T['type'] extends 'string'
        ? T extends { variadic: true }
          ? T extends { required: true }
            ? [string, ...string[]]
            : string[]
          : string
        : T['type'] extends undefined
          ? T extends { variadic: true }
            ? T extends { required: true }
              ? [string, ...string[]]
              : string[]
            : string
          : T['default'] extends undefined
            ? string
            : T['default'];

/** Helper to get required keys */
type RequiredKeys<T> = {
  [K in keyof T]: T[K] extends { required: true } ? K : never;
}[keyof T];

/** Helper to get optional keys */
type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

/** Map options record to an object type with required/optional properties */
export type OptionsToObject<T extends Record<string, any>> = { [K in RequiredKeys<T>]: ArgValueType<T[K]> } & {
  [K in OptionalKeys<T>]?: ArgValueType<T[K]>;
};

/** Map positionals array to an object type with required/optional properties */
export type PositionalsToObject<T extends Record<string, PositionalArgument> | undefined> = T extends Record<string, infer P>
  ? P extends PositionalArgument
    ? P['required'] extends true
      ? { [K in keyof T]: ArgValueType<P> }
      : { [K in keyof T]?: ArgValueType<P> }
    : Record<string, never>
  : Record<string, never>;

/** The full result type for parseArgs */
export type ArgsResult<C extends Config> = PositionalsToObject<C['command']['positionals']> & OptionsToObject<C['options']>;
