import { parse } from 'dotenv'
import env from '../../.env'

Object.assign(process.env, {
  ...parse(env),
})

await import('./index')
