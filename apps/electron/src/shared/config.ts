export type Config = {
  'db.path': string
  'worker.path': string
  'userdata.path': string

  'app.env': 'development' | 'production'
  'app.language'?: string
  'app.version'?: string

  'backup.enabled': boolean
  'backup.type'?: string

  'privacy.analytics.enabled': boolean
  'privacy.crashReporting.enabled': boolean

  'scan.auto.enabled': boolean

  'sync.enabled': boolean
  'sync.apiKey'?: string
  'sync.interval'?: number
  'sync.serverURL'?: string

  'window.height': number
  'window.width': number
  'window.x': number
  'window.y': number
}

export type ConfigKey = keyof Config
