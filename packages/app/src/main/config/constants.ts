import process from 'node:process'
import { app } from 'electron'

export const IS_DEV =
  process.env.NODE_ENV === 'development' || app.isPackaged === false
