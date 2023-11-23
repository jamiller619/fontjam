#!/usr/bin/env node
import cp from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { Metadata, parse } from './MetadataParser'

const GIT_PATH = process.env.GOOGLE_FONTS_GIT_PATH
const exec = promisify(cp.exec)

console.log(`Running git pull @ "${GIT_PATH}"`)

const gitpull = await exec('git pull', {
  cwd: GIT_PATH,
})

if (gitpull.stderr) {
  console.error(`Error during "git pull"`, gitpull.stderr)

  process.exit(1)
}

console.log('git up-to-date, generating font list now...')

const gitls = await exec('git ls-files', {
  cwd: GIT_PATH,
})

if (gitls.stderr) {
  console.error(`Error during "git ls-files"`, gitls.stderr)

  process.exit(1)
}

const files = gitls.stdout.split('\n')
const dirs = ['apache', 'ofl', 'ufl']
const fonts: Record<string, Metadata> = {}

for (const file of files) {
  try {
    if (!file) continue

    let shouldContinue = true
    for (const dir of dirs) {
      if (file.startsWith(dir)) {
        shouldContinue = false
      }
    }

    if (shouldContinue) continue

    const [_, fontName] = file.split('/')

    if (!fontName) continue

    if (file.endsWith('METADATA.pb')) {
      const font = await parse(path.join(GIT_PATH, file))

      if (font) {
        fonts[fontName] = {
          ...font,
          path: file.replace('/METADATA.pb', ''),
        }
      }
    }
  } catch (err) {
    console.error(err)
  }
}

console.log('Writing json file now...')

await fs.writeFile('dist/fonts.json', JSON.stringify(fonts, null, 2))
