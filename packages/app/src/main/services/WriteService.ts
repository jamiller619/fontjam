import ReadRepository from '~/db/ReadRepository'
import type { Connection } from '~/db/connect'
import connect from './connect'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function automap<T extends (...args: [Connection, ...any]) => any>(fn: T) {
  return async (
    ...args: DropFirst<Parameters<T>>
  ): Promise<Awaited<ReturnType<T>>> => {
    await using conn = await connect()

    return fn(conn, ...args)
  }
}

const getLibraries = ReadRepository.getLibraries.bind(ReadRepository)
const getFamilies = ReadRepository.getFamilies.bind(ReadRepository)
const getFamily = ReadRepository.getFamily.bind(ReadRepository)
const getLibraryStats = ReadRepository.getLibraryStats.bind(ReadRepository)

export default class ReadService {
  static getLibraries = automap(getLibraries)
  static getFamilies = automap(getFamilies)
  static getFamily = automap(getFamily)
  static getLibraryStats = automap(getLibraryStats)
}
