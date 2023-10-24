export function toTitleCase<T extends string | undefined>(str: T) {
  return str?.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  ) as T
}
