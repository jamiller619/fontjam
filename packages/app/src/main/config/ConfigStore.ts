import Store from 'conf'
import { ConfigKey, ConfigSchema } from '@shared/config'

const escape = (str: string) => str.replace(/[\\.[]/g, '\\$&')

// The electron-store module requires escaping keys that
// contain dots, so this class simply wraps the store to do
// that for us. Now we can do `config.get('some.config.key')`
export default class ConfigStore extends Store<ConfigSchema> {
  get<K extends ConfigKey>(key: K): ConfigSchema[K] {
    return super.get(escape(key))
  }

  set<K extends ConfigKey>(key: K, value?: ConfigSchema[K]): void {
    return super.set(escape(key), value)
  }

  has<K extends ConfigKey>(key: K) {
    return super.has(escape(key))
  }
}
