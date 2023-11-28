import { Font, FontFamily } from '@fontjam/shared/types'
import { Metadata, MetadataFont } from './MetadataParser'

function parseFont(data: MetadataFont) {
  const font: Font = {
    fullName: data.full_name,
    postscriptName: data.post_script_name,
    style: data.style,
    weight: data.weight,
  }

  return font
}

export function parse(data: Metadata) {
  const family: FontFamily = {
    copyright: data.copyright,
    designer: data.designer,
    license: data.license,
    name: data.name,
    popularity: null,
    tags: null,
    fonts: data.fonts.map(parseFont),
  }

  return family
}
