import ReadRepository from '~/db/ReadRepository'
import autobind from '../autobind'
import { createConnector } from './connect'

const getLibraries = ReadRepository.getLibraries.bind(ReadRepository)
const getFamilies = ReadRepository.getFamilies.bind(ReadRepository)
const getFamily = ReadRepository.getFamily.bind(ReadRepository)
const getLibraryStats = ReadRepository.getLibraryStats.bind(ReadRepository)

export default class ReadService {
  // static getLibraries = automap(createConnector('read'), getLibraries)
  // static getFamilies = automap(createConnector('read'), getFamilies)
  // static getFamily = automap(createConnector('read'), getFamily)
  // static getLibraryStats =
  // automap(createConnector('read'), getLibraryStats)
  static async getLibraries() {
    await using conn = await createConnector('read')()

    return ReadRepository.getLibraries(conn)
  }

  static async getFamilies(...args) {
    await using conn = await createConnector('read')()

    return ReadRepository.getFamilies(conn, ...args)
  }

  static async getFamily(...args) {
    await using conn = await createConnector('read')()

    return ReadRepository.getFamily(conn, ...args)
  }

  static async getLibraryStats(...args) {
    await using conn = await createConnector('read')()

    return ReadRepository.getLibraryStats(conn, ...args)
  }
}
