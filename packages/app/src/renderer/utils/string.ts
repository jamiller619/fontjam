export function toTitleCase<T extends string | undefined>(str: T) {
  return str?.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  ) as T
}

/**
 * i.e.
 * pluralize(0, 'turtle')     // 0 turtles
 * pluralize(1, 'turtle')     // 1 turtle
 * pluralize(2, 'turtle');    // 2 turtles
 * pluralize(3, 'fox', 'es'); // 3 foxes
 *
 * @param count The number of "things"
 * @param noun The "thing"
 * @param suffix The suffix
 * @returns The pluralized version of the input
 */
export function pluralize<T>(count: number, noun?: string, suffix = 's'): T {
  return (
    !noun ? undefined : `${count} ${noun}${count !== 1 ? suffix : ''}`
  ) as T
}
