import { Font, FontFamily } from '@shared/types/dto'

export type FontFamilyEntity = Omit<FontFamily, 'fonts' | 'tags'> & {
  tags: string | null
}

export type FontEntity = Omit<Font, 'fvar'> & {
  fvar: string | null
}
