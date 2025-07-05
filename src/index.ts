import type { ArgsResult, ArgumentOptions, Config } from './interfaces.js';
import { camelToKebab, kebabToCamel } from './utils.js';

export type * from './interfaces.js';

const defaultOptions: Record<string, ArgumentOptions> = {
  help: { alias: 'h', description: 'Show help', type: 'boolean' },
  version: { alias: 'v', description: 'Show version number', type: 'boolean' },
};

export function parseArgs<C extends Config>(config: C): ArgsResult<C> {
  const { command, options, version } = config;

  // Normalize args to support --option=value and -o=value
  const args = process.argv.slice(2).flatMap(arg => {
    if (/^--?\w[\w-]*=/.test(arg)) {
      const [flag, ...rest] = arg.split('=');
      return [flag, rest.join('=')];
    }
    return arg;
  });
  const result: Record<string, any> = {};

  // Check for duplicate aliases
  const aliasMap = new Map<string, string>();
  for (const [key, opt] of Object.entries(options)) {
    if (opt.alias) {
      if (aliasMap.has(opt.alias)) {
        throw new Error(`Duplicate alias detected: "${opt.alias}" used for both "${aliasMap.get(opt.alias)}" and "${key}"`);
      }
      aliasMap.set(opt.alias, key);
    }
  }

  // Handle --help and --version before anything else
  if (args.includes('--help') || args.includes('-h')) {
    printHelp(config);
    process.exit(0);
  }
  if ((version && args.includes('--version')) || args.includes('-v')) {
    console.log(version || 'No version specified');
    process.exit(0);
  }

  // Validate: required positionals must come before optional ones
  const positionals = command.positionals ?? [];
  let foundOptional = false;
  for (const pos of positionals) {
    if (!pos.required) {
      foundOptional = true;
    }
    if (foundOptional && pos.required) {
      throw new Error(`Invalid positional argument configuration: required positional "${pos.name}" cannot follow optional positional(s).`);
    }
  }

  // Handle positional arguments
  let argIndex = 0;
  const nonOptionArgs: string[] = [];
  while (argIndex < args.length && !args[argIndex].startsWith('-')) {
    nonOptionArgs.push(args[argIndex]);
    argIndex++;
  }

  let nonOptionIndex = 0;
  for (let i = 0; i < positionals.length; i++) {
    const pos = positionals[i];
    if (pos.variadic) {
      const remaining = positionals.length - (i + 1);
      const values = nonOptionArgs.slice(nonOptionIndex, nonOptionArgs.length - remaining);
      if (pos.required && values.length === 0) {
        const usagePositionals = buildUsagePositionals(positionals);
        throw new Error(`Missing required positional argument, i.e.: "${command.name} ${usagePositionals}"`);
      }
      result[pos.name] = !pos.required && values.length === 0 && pos.default !== undefined ? pos.default : values;
      nonOptionIndex += values.length;
    } else {
      const value = nonOptionArgs[nonOptionIndex];
      // Check if there are enough args left for required positionals
      const requiredLeft = positionals.slice(i).filter(p => p.required).length;
      const argsLeft = nonOptionArgs.length - nonOptionIndex;
      if (value !== undefined && (argsLeft > requiredLeft - (pos.required ? 1 : 0) || pos.required)) {
        result[pos.name] = value;
        nonOptionIndex++;
      } else if (!pos.required && pos.default !== undefined) {
        result[pos.name] = pos.default;
      } else if (pos.required) {
        const usagePositionals = buildUsagePositionals(positionals);
        throw new Error(`Missing required positional argument, i.e.: "${command.name} ${usagePositionals}"`);
      }
    }
  }

  // Handle options
  argIndex = 0;
  const consumedArgs = new Set<number>();
  // Mark all nonOptionArgs indices as consumed for positionals
  let tempNonOptionIndex = 0;
  for (let i = 0; i < positionals.length; i++) {
    const pos = positionals[i];
    if (pos.variadic) {
      const remaining = positionals.length - (i + 1);
      const values = nonOptionArgs.slice(tempNonOptionIndex, nonOptionArgs.length - remaining);
      for (let j = tempNonOptionIndex; j < tempNonOptionIndex + values.length; j++) {
        consumedArgs.add(args.findIndex((a, idx) => !a.startsWith('-') && !consumedArgs.has(idx) && a === nonOptionArgs[j]));
      }
      tempNonOptionIndex += values.length;
    } else {
      const value = nonOptionArgs[tempNonOptionIndex++];
      consumedArgs.add(args.findIndex((a, idx) => !a.startsWith('-') && !consumedArgs.has(idx) && a === value));
    }
  }

  while (argIndex < args.length) {
    if (consumedArgs.has(argIndex)) {
      argIndex++;
      continue;
    }
    const argOrg = args[argIndex] || '';
    let arg = argOrg;
    let option: ArgumentOptions | undefined;
    let configKey: string | undefined;

    if (argOrg.startsWith('-')) {
      if (argOrg.startsWith('--')) {
        arg = argOrg.slice(2);
        [option, configKey] = findOption(options, arg);
      } else if (argOrg.startsWith('-')) {
        arg = argOrg.slice(1);
        [option, configKey] = findOption(options, arg);
      }

      // Handle negated boolean in both forms
      if (!option) {
        const isNegated = arg.startsWith('no-');
        const optionName = isNegated ? arg.slice(3) : arg;
        const camelOptionName = kebabToCamel(optionName);
        option = options[optionName] || options[camelOptionName];
        configKey = camelOptionName in options ? camelOptionName : optionName;
        if (option?.type === 'boolean') {
          if (result[optionName] !== undefined || result[camelOptionName] !== undefined) {
            throw new Error('Providing same negated and truthy argument are not allowed');
          }
          result[configKey] = !isNegated;
          argIndex++;
          continue;
        }
      }

      if (!option || !configKey) {
        throw new Error(`Unknown CLI option: ${arg}`);
      }

      switch (option.type) {
        case 'boolean':
          if (result[configKey] !== undefined) {
            throw new Error('Providing same negated and truthy argument are not allowed');
          }
          result[configKey] = !argOrg.startsWith('--no-') && !argOrg.startsWith('-no-');
          break;
        case 'number':
          if (args[argIndex + 1] === undefined || args[argIndex + 1].startsWith('-')) {
            throw new Error(`Missing value for option: ${configKey}`);
          }
          result[configKey] = Number(args[++argIndex]);
          break;
        case 'array': {
          if (!result[configKey]) result[configKey] = [];
          const arrayValue = args[++argIndex];
          if (arrayValue === undefined || arrayValue.startsWith('-')) {
            throw new Error(`Missing value for array option: ${configKey}`);
          }
          result[configKey].push(arrayValue);
          break;
        }
        case 'string':
        default:
          if (args[argIndex + 1] === undefined || args[argIndex + 1].startsWith('-')) {
            throw new Error(`Missing value for option: ${configKey}`);
          }
          result[configKey] = args[++argIndex];
          break;
      }
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
    argIndex++;
  }

  // After all parsing, assign any `default` CLI options when undefined
  // and check for any missing `required` CLI options
  Object.entries(options).forEach(([key, opt]) => {
    if (result[key] === undefined && opt.default !== undefined) {
      result[key] = opt.default;
    }
    if (opt.required && result[key] === undefined) {
      const aliasStr = opt.alias ? `-${opt.alias}, ` : '';
      throw new Error(`Missing required option: ${aliasStr}--${key}`);
    }
  });

  return result as ArgsResult<C>;
}

/** Format a text to a fixed length, truncating and padding as needed. */
function formatHelpText(text: string, max: number) {
  const truncated = text.length > max ? `${text.slice(0, max - 3)}...` : text;
  return truncated.padEnd(max);
}

/** Build the usage string for positionals, e.g. "<input..> [output]" */
function buildUsagePositionals(positionals: readonly any[] = []) {
  return positionals
    .map(p => {
      const variadic = p.variadic ? '..' : '';
      return p.required ? `<${p.name}${variadic}>` : `[${p.name}${variadic}]`;
    })
    .join(' ');
}

/** Format the option/argument type for help output */
function formatOptionType(type: string | undefined, variadic?: boolean, required?: boolean) {
  const t = type || 'string';
  const variadicStr = variadic ? '..' : '';
  return required ? `<${t}${variadicStr}>` : `[${t}${variadicStr}]`;
}

/** Helper to find an option and its config key by argument name or alias. */
function findOption(options: Record<string, ArgumentOptions>, arg: string): [ArgumentOptions | undefined, string | undefined] {
  // Try all forms: as-is, kebab-to-camel, camel-to-kebab
  const option = options[arg] || options[kebabToCamel(arg)] || options[camelToKebab(arg).replace(/-/g, '')];
  if (option) {
    const configKey = Object.keys(options).find(key => options[key] === option);
    return [option, configKey];
  }
  // Try matching alias in all forms
  for (const key of Object.keys(options)) {
    const opt = options[key];
    if (opt.alias && (opt.alias === arg || opt.alias === kebabToCamel(arg) || opt.alias === camelToKebab(arg))) {
      return [opt, key];
    }
  }
  return [undefined, undefined];
}

/** Print CLI help documentation to the screen */
function printHelp(config: Config) {
  const { command, options, version, helpOptLength = 20, helpDescLength = 65 } = config;
  const usagePositionals = buildUsagePositionals(command.positionals);

  console.log('Usage:');
  console.log(`  ${command.name} ${usagePositionals} [options]  ${command.description}`);
  console.log('\nArguments:');
  command.positionals?.forEach(arg => {
    console.log(
      `  ${formatHelpText(arg.name, helpOptLength)}${formatHelpText(arg.description, helpDescLength)} ${formatOptionType(arg.type, arg.variadic, arg.required)}`,
    );
  });

  console.log('\nOptions:');
  for (const [key, option] of Object.entries({ ...options, ...defaultOptions })) {
    const aliasStr = option.alias ? `-${option.alias}, ` : '';
    if (!version && key === 'version') {
      continue;
    }
    console.log(
      `  ${aliasStr.padEnd(4)}--${formatHelpText(key, helpOptLength - 6)}${formatHelpText(option.description || '', helpDescLength)} ${formatOptionType(option.type, false, option.required)}`,
    );
  }
}
