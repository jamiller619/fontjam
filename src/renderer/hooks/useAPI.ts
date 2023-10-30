import useSWR, { SWRConfiguration } from 'swr'
import type { API, APIKey } from '@shared/api'

const fetcher = async <K extends APIKey, P = Parameters<API[K]>>([
  key,
  params,
]: [K, P]) => {
  // @ts-ignore: this works
  const results = await window.api[key](...(params ?? []))

  console.log(key, params, results)

  return results
}

export default function useAPI<
  K extends APIKey,
  P = Parameters<API[K]>,
  R = Awaited<ReturnType<API[K]>>
>(key: K, params?: P, config?: SWRConfiguration) {
  const { data, error, mutate } = useSWR<R, Error>(
    [key, params],
    fetcher as ([key, params]: [K, P]) => R,
    config
  )

  const isLoading = !data && !error

  return {
    data,
    isLoading,
    error,
    mutate,
  }
}
