import TypedEmitter, { EventMap } from 'typed-emitter'
import { Logger } from '@fontjam/electron-logger'
import type { ConfigStore } from '~/config'
import { WrappedEventMap } from './EventBus'

type ModuleContext<E extends EventMap = EventMap> = {
  eventBus: TypedEmitter<WrappedEventMap<E>>
  config: ConfigStore
  log: Logger
}

export default ModuleContext
