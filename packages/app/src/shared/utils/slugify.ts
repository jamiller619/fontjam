export default function slugify<T>(str: T) {
  if (!str || typeof str !== 'string') {
    return str as T
  }

  const result = str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens

  return result as T
}
