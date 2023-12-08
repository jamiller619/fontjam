export function titleCase<T extends string | undefined>(str: T) {
  return str?.replace(/\w\S*/g, capitalize) as T
}

export function capitalize<T extends string | undefined>(str: T) {
  return (
    str ? `${str.charAt(0).toUpperCase()}${str.slice(1)}` : undefined
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

export function slugify<T extends unknown | undefined>(val: T) {
  if (!val || !val.toString) {
    return val
  }

  const str = typeof val !== 'string' ? val.toString() : val

  const result = str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens

  return result as T
}
