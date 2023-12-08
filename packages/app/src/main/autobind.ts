import { type Connection } from '~/db/connect'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

export default function autobind<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: [Connection, ...any]) => any,
>(conn: Connection, fn: T) {
  return async (
    ...args: DropFirst<Parameters<T>>
  ): Promise<Awaited<ReturnType<T>>> => {
    const result = await fn(conn, ...args)

    return result
  }
}
