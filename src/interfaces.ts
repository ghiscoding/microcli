export interface ArgumentOptions {
  /** option type */
  type?: 'string' | 'boolean' | 'number' | 'array';

  /** description of the flag option */
  description: string;

  /** defaults to undefined, provide shorter aliases as command options */
  alias?: string | string[];

  /** default value for the option if not provided */
  default?: any;

  /** defaults to false, is the option required? */
  required?: boolean;
}

export interface PositionalArgument {
  /** positional argument name (it will be displayed in the help docs) */
  name: string;

  /** positional argument description */
  description: string;

  /** postional argument type */
  type?: 'string' | 'boolean' | 'number' | 'array';

  /** defaults to false, allows multiple values for this positional argument */
  variadic?: boolean;

  /** default value for the option if not provided */
  default?: any;

  /** defaults to false, is the positional argument required? */
  required?: boolean;
}

export interface CommandOptions {
  /** command name, used in the help docs */
  name: string;

  /** command description */
  description: string;

  /** list of positional arguments */
  positionals?: readonly PositionalArgument[];
}

/** CLI options */
export interface Config {
  /** CLI definition */
  command: CommandOptions;

  /** CLI list of flag options */
  options: Record<string, ArgumentOptions>;

  /** CLI or package version */
  version?: string;

  /** defaults to 65, length of description shown in the help */
  helpDescLength?: number;
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
export type PositionalsToObject<T extends readonly PositionalArgument[] | undefined> = T extends readonly [infer P, ...infer Rest]
  ? P extends PositionalArgument
    ? (P['required'] extends true ? { [K in P['name']]: ArgValueType<P> } : { [K in P['name']]?: ArgValueType<P> }) &
        PositionalsToObject<Rest extends readonly PositionalArgument[] ? Rest : []>
    : PositionalsToObject<Rest extends readonly PositionalArgument[] ? Rest : []>
  : { [key: string]: never };

/** The full result type for parseArgs */
export type ArgsResult<C extends Config> = PositionalsToObject<C['command']['positionals']> & OptionsToObject<C['options']>;
