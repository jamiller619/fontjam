import opentype from 'opentype.js'
import { useEffect, useState } from 'react'
import { useIsMounted } from 'usehooks-ts'
import slugify from '@shared/utils/slugify'

export function useFontURL(fontId?: number, fontName?: string) {
  if (!fontId || !fontName) return undefined

  const slug = slugify(fontName)
  const url = `font://localhost/${slug}/?id=${fontId}`

  return url
}

function isFontLoaded(fontName?: string | null) {
  if (!fontName) return false

  try {
    return document.fonts.check(`12px ${fontName}`)
  } catch {
    return false
  }
}

export function useFontFace(fontId?: number, fontName?: string) {
  const url = useFontURL(fontId, fontName)
  const [isLoaded, setIsLoaded] = useState(isFontLoaded(fontName))
  const isMounted = useIsMounted()

  useEffect(() => {
    if (isLoaded || !fontName || !url) return

    if (isFontLoaded(fontName)) {
      setIsLoaded(true)

      return
    }

    // const fontFace = new FontFace(fontName, `url("${url}")`)

    // document.fonts.add(fontFace)

    // fontFace
    //   .load()
    //   .then(() => (isMounted() ? setIsLoaded(true) : null))
    //   .catch((err) => {
    //     console.error(err)
    //   })
  }, [fontName, isLoaded, isMounted, url])

  return isLoaded
}

const fontDataCache = new Map<string, opentype.Font>()

export default function useFontData(fontId?: number, fontName?: string) {
  const url = useFontURL(fontId, fontName)
  const [fontData, setFontData] = useState<opentype.Font | null>(
    url ? fontDataCache.get(url) ?? null : null
  )
  const isMounted = useIsMounted()

  useEffect(() => {
    if (!url) return

    if (fontDataCache.has(url)) {
      setFontData(fontDataCache.get(url)!)
    } else {
      fetch(url).then(async (res) => {
        const font = opentype.parse(await res.arrayBuffer())

        if (isMounted()) {
          fontDataCache.set(url, font)
          setFontData(font)
        }
      })
    }
  }, [isMounted, fontData, url])

  return fontData
}
