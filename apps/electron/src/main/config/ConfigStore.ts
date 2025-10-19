import Store from 'electron-store'
import { Config, ConfigKey } from '@shared/config'

const escape = (str: string) => str.replace(/[\\.[]/g, '\\$&')

// The electron-store module requires escaping keys that
// contain dots, so this class simply wraps the store to do
// that for us. Now we can do `config.get('some.config.key')`
export default class ConfigStore extends Store<Config> {
  override get<K extends ConfigKey>(key: K): Config[K] {
    return super.get(escape(key))
  }

  override set<K extends ConfigKey>(key: K, value?: Config[K]): void {
    return super.set(escape(key), value)
  }

  override has<K extends ConfigKey>(key: K): boolean {
    return super.has(escape(key) as ConfigKey)
  }
}
