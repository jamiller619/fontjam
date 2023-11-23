import { protocol } from 'electron'
import protocols from './protocols.json'

export default function registerSchemes() {
  const schemes = Object.entries(protocols).map(([key, value]) => ({
    scheme: key,
    privileges: value,
  }))

  protocol.registerSchemesAsPrivileged(schemes)
}
