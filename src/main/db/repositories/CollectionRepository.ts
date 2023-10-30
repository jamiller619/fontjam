import { Collection } from '@shared/types'
import { createId } from '@shared/utils/id'
import { createClient } from '~/db/client'
import Repository from '../Repository'
import toRecord from './toRecord'

const defaultCollections: Collection[] = [
  {
    id: createId(),
    createdAt: Date.now(),
    name: 'Active',
    isEditable: false,
    icon: 'CircleSmall20Filled',
    query: 'active',
  },
  {
    id: createId(),
    createdAt: Date.now(),
    name: 'Inactive',
    isEditable: false,
    icon: 'CircleSmall20Regular',
    query: 'inactive',
  },
]

const getClient = createClient('collections', toRecord(defaultCollections))

export const collectionClient = getClient()
export type CollectionClient = Awaited<typeof collectionClient>

class CollectionRepository extends Repository<Collection> {}

export default new CollectionRepository()
