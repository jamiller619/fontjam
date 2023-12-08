import opentype from 'opentype.js'
import { useEffect, useState } from 'react'
import { useIsMounted } from 'usehooks-ts'
import { Font } from '@shared/types'
import { slugify } from '@shared/utils/string'

export function useFontURL(fontId?: number, fontName?: string) {
  if (!fontId || !fontName) return undefined

  const slug = slugify(fontName)
  const url = `font://localhost/${slug}?id=${fontId}`

  return url
}

async function loadFontFace(fontName?: string, fontURL?: string) {
  if (!fontName || !fontURL) return undefined

  try {
    const fontFace = new FontFace(fontName, `url("${fontURL}")`)

    document.fonts.add(fontFace)

    await fontFace.load()

    return true
  } catch (err) {
    return err as Error
  }
}

function parseName(font?: Font) {
  if (!font) return undefined

  if (font.postscriptName) {
    return font.postscriptName
  }

  return [font.fullName, font.weight ? null : font.style, font.weight]
    .filter(Boolean)
    .join(' ')
}

export function useFontFace(font?: Font) {
  const fontName = parseName(font)
  const url = useFontURL(font?.id, fontName)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const isMounted = useIsMounted()

  useEffect(() => {
    if (!font || !url) {
      return
    }

    if (isLoaded) {
      return
    }

    loadFontFace(fontName, url).then((resp) => {
      if (isMounted()) {
        if (resp instanceof Error) {
          setError(resp)
        } else if (resp === true) {
          setIsLoaded(true)
        }
      }
    })
  }, [font, fontName, isLoaded, isMounted, url])

  return error ?? isLoaded
}

export default function useFontData(font?: Font) {
  const url = useFontURL(font?.id, font?.fullName)
  const [fontData, setFontData] = useState<opentype.Font | null>(null)
  const isMounted = useIsMounted()

  useEffect(() => {
    if (!url || fontData) return

    fetch(url).then(async (res) => {
      const font = opentype.parse(await res.arrayBuffer())

      if (isMounted()) {
        setFontData(font)
      }
    })
  }, [isMounted, fontData, url])

  return fontData
}
