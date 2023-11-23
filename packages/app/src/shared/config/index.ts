import type json from './schema.json'

export * from './schema'

export type ConfigKey = keyof typeof json.properties

export type ConfigSchemaDocument = {
  [key in ConfigKey]: (typeof json.properties)[key] & {
    value?: unknown
  }
}
