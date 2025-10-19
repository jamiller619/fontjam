import * as dto from '@shared/types/dto'
import { date } from '~/db'
import * as entity from './entity'

export function to(library: dto.Library) {
  const mapped: entity.Library = {
    id: library.id,
    user_id: library.userId ?? null,
    created_at: date.toSQL(library.createdAt),
    updated_at: date.toSQL(library.updatedAt),
    description: library.description,
    name: library.name,
    visibility: library.visibility,
    source: JSON.stringify(library.source),
  }

  return mapped
}

export function from(library: entity.Library) {
  const mapped: dto.Library = {
    id: library.id,
    createdAt: date.fromSQL(library.created_at),
    updatedAt: library.updated_at
      ? date.fromSQL(library.updated_at)
      : undefined,
    userId: library.user_id ?? undefined,
    name: library.name,
    description: library.description,
    visibility: library.visibility,
    source: JSON.parse(library.source),
  }

  return mapped
}
