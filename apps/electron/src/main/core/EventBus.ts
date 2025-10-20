import { EventMap } from 'typed-emitter'

export type ModuleEventPayload<K extends PropertyKey, T> = {
  module: string
  event: K
  data: T
  timestamp: number
}

/**
 * Converts each event signature `(data: T) => void`
 * into `(payload: Payload<K, T>) => void`
 */
export type WrappedEventMap<E extends EventMap = EventMap> = {
  [K in keyof E]: (payload: ModuleEventPayload<K, Parameters<E[K]>[0]>) => void
}
