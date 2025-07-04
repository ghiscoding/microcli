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
  positionals?: PositionalArgument[];
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
