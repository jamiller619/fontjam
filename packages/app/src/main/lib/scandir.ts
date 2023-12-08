import fs from 'node:fs/promises'
import path from 'node:path'

type EntType = 'dir' | 'file'

type Ent = {
  type: EntType
  path: string
}

/**
 * Recursively scans a directory for files and directories,
 * returning the absolute path for each one found.
 *
 * @param dir The directory to scan
 */
export default async function* scandir(dir: string): AsyncGenerator<Ent> {
  const ents = await fs.readdir(dir, {
    withFileTypes: true,
  })

  for await (const ent of ents) {
    const entPath = path.join(ent.path, ent.name)

    if (ent.isFile()) {
      yield {
        type: 'file',
        path: entPath,
      }
    } else if (ent.isDirectory()) {
      yield {
        type: 'dir',
        path: entPath,
      }

      yield* scandir(entPath)
    }
  }
}
