import EventEmitter from 'events'
import TypedEmitter from 'typed-emitter'

type EventMap = {
  complete: () => unknown
  start: () => unknown
}

export default class Stats<
  T extends object = object
> extends (EventEmitter as new () => TypedEmitter<EventMap>) {
  startTime: number | null = null
  endTime: number | null = null
  state = {} as T

  get duration() {
    if (this.endTime == null) {
      throw new Error(`Cannot get duration until "complete" is called!`)
    }

    if (this.startTime == null) {
      throw new Error(`Cannot get duration until "start" is called!`)
    }

    return this.endTime - this.startTime
  }

  start() {
    this.startTime = Date.now()

    this.emit('start')

    return this
  }

  complete() {
    this.endTime = Date.now()

    this.emit('complete')

    return this
  }

  update(callback: (stats: T) => T) {
    this.state = callback(this.state)

    return this
  }

  constructor(state = {} as T) {
    super()

    this.state = state
  }
}
