/* eslint-disable @typescript-eslint/no-namespace */
import * as dto from '@shared/types/dto'

export namespace entity {
  export type FontFamilyWithFontJoin = {
    id: string
    created_at: number
    library_id: string
    name: string
    metadata: string

    font_id: string
    font_created_at: number
    font_family_id: string
    font_license: string | null
    font_metadata: string
    font_fvar: string | null
    font_name: string
    font_url: string
    font_format: string
    font_hash: string
    font_weight: number | null
    font_style: string
    font_version: string | null
  }

  export type Font = Omit<
    dto.Font,
    'createdAt' | 'familyId' | 'family' | 'license' | 'metadata' | 'fvar'
  > & {
    created_at: number
    family_id: string
    name: string
    url: string
    format: string
    hash: string
    weight: number | null
    style: string
    version: string | null
    license: string | null
    metadata: string
    fvar: string | null
  }

  export type FontFamily = {
    id: string
    created_at: number
    library_id: string
    name: string
    metadata: string | null
    fonts: Font[] | null
  }

  export type Activation = Omit<
    dto.Activation,
    'fontId' | 'deviceId' | 'activatedAt'
  > & {
    font_id: string
    device_id: string
    activated_at: number
  }
}
