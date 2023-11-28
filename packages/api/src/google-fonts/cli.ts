#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createGitter } from '~/gitter'
import { Metadata, parse } from './MetadataParser'

const GIT_PATH = process.env.GOOGLE_FONTS_GIT_PATH
const git = await createGitter('https://github.com/google/fonts', GIT_PATH)

const gitpull = await git('pull')

if (!gitpull) process.exit(1)

const gitls = await git('ls-files')

if (!gitls) process.exit(1)

const files = gitls.split('\n')

// These are the known directories within the repo that
// contain the fonts, in addition to any metadata
const fontDirectories = ['apache', 'ofl', 'ufl']

const fonts: Record<string, Metadata> = {}

for (const file of files) {
  try {
    // If we can coerse to false, probably not a file ;)
    if (!file) continue

    // If file isn't in a known directory, skip it
    let shouldContinue = true
    for (const dir of fontDirectories) {
      if (file.startsWith(dir)) {
        shouldContinue = false
      }
    }

    if (shouldContinue) continue

    // The font name is the name of the first directory
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

console.log('Writing json file...')

await fs.writeFile(
  process.env.GOOGLE_FONTS_JSON_SAVE_PATH,
  JSON.stringify(fonts, null, 2)
)
