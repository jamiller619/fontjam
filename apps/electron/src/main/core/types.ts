import TypedEmitter, { EventMap } from 'typed-emitter'
import { Logger } from '@fontjam/electron-logger'
import type { ConfigStore } from '~/config'

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

export type ModuleContext<E extends EventMap = EventMap> = {
  eventBus: TypedEmitter<WrappedEventMap<E>>
  config: ConfigStore
  log: Logger
}
