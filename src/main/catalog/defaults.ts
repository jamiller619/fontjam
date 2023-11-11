import { CatalogTypeName } from '@shared/types'
import defs from './defaults.json'

export function getDefaults(type: CatalogTypeName) {
  return defs.filter((d) => d.type === type)
}
