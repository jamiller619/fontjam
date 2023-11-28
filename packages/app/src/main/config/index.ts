import { Schema as StoreSchema } from 'conf'
import { name } from '@root/package.json'
import { ConfigSchema } from '@shared/config'
import json from '@shared/config/schema.json'
import ConfigStore from './ConfigStore'

export type { default as ConfigStore } from './ConfigStore'

const config = new ConfigStore({
  projectName: name,
  projectSuffix: '',
  schema: json.properties as StoreSchema<ConfigSchema>,
})

export default config

export * from './constants'
export { default as paths } from './paths'
