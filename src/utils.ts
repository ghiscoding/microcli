/** Utility to convert kebab-case to camelCase */
export function kebabToCamel(str: string) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** Utility to convert camelCase to kebab-case */
export function camelToKebab(str: string) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/** add whitespace padding to any input string */
export function padString(input: string, padding: number) {
  return input.padEnd(padding);
}
