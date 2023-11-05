function formatNull<T>(val: T) {
  if (val == null) return 'NULL'

  return val
}

function formatArray<T>(arr: T[]) {
  return arr.map((k) => `"${formatNull(String(k))}"`).join(', ')
}

type Prim = string | number | undefined | null | symbol

/**
 * A simple template tag that makes writing SQL queries a little easier.
 */
export default function sql(
  strings: TemplateStringsArray,
  ...keys: (Prim | Prim[])[]
) {
  const result = [strings[0]]

  keys.forEach((key, i) => {
    const val = Array.isArray(key)
      ? formatArray(key)
      : formatNull(String(key)).trim()

    result.push(val, strings[i + 1])
  })

  return result.join('')
}
