import fs from 'node:fs/promises'
import path from 'node:path'

export default {
  scanDir: async function* scanDir(dir: string) {
    const files = await fs.readdir(dir, {
      withFileTypes: true,
    })

    for await (const file of files) {
      if (!file.isFile()) {
        if (!file.isDirectory()) {
          continue
        }

        scanDir(path.join(dir, file.name))
      } else {
        yield path.join(dir, file.path)
      }
    }
  },
}
