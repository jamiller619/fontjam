import { Schema as StoreSchema } from 'conf'
import { ConfigSchema } from '@shared/config'
import json from '@shared/config/schema.json'
import { name } from '../../../package.json'
import ConfigStore from './ConfigStore'

export type { default as ConfigStore } from './ConfigStore'

const config = new ConfigStore({
  projectName: name,
  projectSuffix: '',
  schema: json.properties as StoreSchema<ConfigSchema>,
})

export default config
