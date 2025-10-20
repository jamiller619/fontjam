import * as dto from '@shared/types/dto'
import { date } from '~/db'
import * as entity from './types'

export const font = {
  fromEntity: (font: entity.Font): dto.Font => {
    return {
      id: font.id,
      createdAt: date.fromSQL(font.created_at),
      familyId: font.family_id,
      name: font.name,
      url: font.url,
      format: font.format,
      hash: font.hash,
      weight: font.weight,
      style: font.style,
      version: font.version,
      license: font.license ? JSON.parse(font.license) : undefined,
      metadata: JSON.parse(font.metadata || '{}'),
      fvar: font.fvar ? JSON.parse(font.fvar) : undefined,
      family: null,
    }
  },

  toEntity: (font: dto.Font): entity.Font => {
    return {
      id: font.id,
      created_at: date.toSQL(font.createdAt),
      family_id: font.familyId,
      name: font.name,
      url: font.url,
      format: font.format,
      hash: font.hash,
      weight: font.weight,
      style: font.style,
      version: font.version,
      license: font.license ? JSON.stringify(font.license) : null,
      metadata: JSON.stringify(font.metadata),
      fvar: font.fvar ? JSON.stringify(font.fvar) : null,
    }
  },
}

export const fontFamily = {
  fromEntity: (family: entity.FontFamily): dto.FontFamily => {
    return {
      id: family.id,
      name: family.name,
      libraryId: family.library_id,
      createdAt: date.fromSQL(family.created_at),
      metadata: family.metadata ? JSON.parse(family.metadata) : null,
      fonts: family.fonts ? family.fonts.map(font.fromEntity) : [],
    }
  },
  toEntity: (family: dto.FontFamily): entity.FontFamily => {
    return {
      id: family.id,
      name: family.name,
      created_at: date.toSQL(family.createdAt),
      library_id: family.libraryId,
      metadata: family.metadata ? JSON.stringify(family.metadata) : null,
      fonts: null,
    }
  },
}

export function fontFamilyJoin(
  families: entity.FontFamilyWithFontJoin[],
): dto.FontFamily[] {
  return families.map((family) => {
    const font: dto.FontFamily = {
      createdAt: date.fromSQL(family.created_at),
      id: family.id,
      libraryId: family.library_id,
      name: family.name,
      metadata: JSON.parse(family.metadata),
      fonts: families
        .filter((font) => font.font_family_id === family.id)
        .map((font) => ({
          id: font.font_id,
          createdAt: date.fromSQL(font.font_created_at),
          family: null,
          familyId: font.font_family_id,
          name: font.font_name,
          url: font.font_url,
          format: font.font_format as dto.FontFormat,
          hash: font.font_hash,
          weight: font.font_weight,
          style: font.font_style,
          license: font.font_license,
          metadata: font.font_metadata,
          fvar: font.font_fvar,
          version: font.font_version,
        })) as dto.Font[],
    }

    return font
  })
}

export const activation = {
  fromEntity: (activation: entity.Activation): dto.Activation => {
    return {
      id: activation.id,
      fontId: activation.font_id,
      deviceId: activation.device_id,
      status: activation.status,
      activatedAt: date.fromSQL(activation.activated_at),
    }
  },
  toEntity: (activation: dto.Activation): entity.Activation => {
    return {
      id: activation.id,
      font_id: activation.fontId,
      device_id: activation.deviceId,
      status: activation.status,
      activated_at: date.toSQL(activation.activatedAt),
    }
  },
}
