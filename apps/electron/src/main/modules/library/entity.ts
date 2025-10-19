import * as dto from '@shared/types/dto'

export type Library = Omit<
  dto.Library,
  'createdAt' | 'updatedAt' | 'userId' | 'source'
> & {
  created_at: number
  updated_at: number | null
  user_id: string | null
  source: string
}
