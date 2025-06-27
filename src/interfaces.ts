export interface ArgumentOptions {
  /** command option type */
  type?: 'string' | 'boolean' | 'number' | 'array';
  /** description of the command option */
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
  /** CLI command name, used in the help docs */
  name: string;
  description: string;
  positional?: PositionalArgument[];
}

export interface Config {
  command: CommandOptions;
  options: Record<string, ArgumentOptions>;
  version?: string;
}
