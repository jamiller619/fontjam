import fs from 'node:fs/promises'
import path from 'node:path'
import envPaths from 'env-paths'
import { Collection } from '@shared/types'
import { collections } from '~/data/defaultData.json'
import { name } from '../../../package.json'
import * as CatalogRepository from './CatalogRepository'

const paths = envPaths(name, {
  suffix: '',
})

async function resolvePath(collectionName: string) {
  const file = path.normalize(
    `${paths.data}/collections/${collectionName}.json`
  )

  await fs.mkdir(path.dirname(file), {
    recursive: true,
  })

  return file
}

export async function init() {
  await CatalogRepository.ready

  const records = await CatalogRepository.getAllCollections()

  for await (const collection of collections) {
    const exists = records.find((r) => r.name === collection.name)

    if (exists == null) {
      await CatalogRepository.createCollection({
        icon: collection.icon as Collection['icon'],
        isEditable: collection.isEditable as 0 | 1,
        name: collection.name,
        path: await resolvePath(collection.name),
      })
    }
  }
}
