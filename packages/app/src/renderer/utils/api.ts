import { API, APIKey } from '@shared/api'
import wait from '@shared/utils/wait'

async function call<K extends APIKey, R extends Awaited<ReturnType<API[K]>>>(
  key: K,
  args: Parameters<API[K]>[] = [],
  attempt = 0
): Promise<R> {
  if (attempt >= 9) {
    throw new Error(`Unable to retreive results after 10 attempts`)
  }

  //@ts-ignore
  const result = await window.api[key](...args)

  if (result instanceof Error) {
    await wait(0.1)

    return call(key, args, attempt + 1)
  }

  return result as R
}

export default {
  call,
}
