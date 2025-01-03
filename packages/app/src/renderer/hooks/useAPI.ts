import useSWR, { SWRConfiguration } from 'swr'
import type { API, APIKey } from '@shared/api'
import api from '~/utils/api'

const fetcher = async <K extends APIKey, P = Parameters<API[K]>>([
  key,
  params,
]: [K, P]) => {
  console.log('calling', key, 'with params', params)
  //@ts-ignore: this works
  const results = await api.call(key, params ?? [])

  console.log('response', key, results)

  return results
}

const defaultConfig: SWRConfiguration = {
  refreshWhenHidden: false,
  revalidateOnFocus: false,
}

export default function useAPI<K extends APIKey>(
  key: K,
  params?: Parameters<API[K]>,
  config?: SWRConfiguration,
) {
  const { data, error, mutate } = useSWR<Awaited<ReturnType<API[K]>>, Error>(
    [key, params],
    fetcher as ([key, params]: [K, Parameters<API[K]>]) => Awaited<
      ReturnType<API[K]>
    >,
    { ...defaultConfig, ...config },
  )

  const isLoading = !data && !error

  return {
    data,
    isLoading,
    error,
    mutate,
  }
}
