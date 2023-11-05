import opentype from 'opentype.js'
import { useEffect, useState } from 'react'
import { useIsMounted } from 'usehooks-ts'
import { FamilyFont } from '@shared/types'
import slugify from '@shared/utils/slugify'

export function useFontURL(fontId?: number, fontName?: string) {
  if (!fontId || !fontName) return undefined

  const slug = slugify(fontName)
  const url = `font://localhost/${slug}/?id=${fontId}`

  return url
}

function isFontLoaded(fontName?: string | null) {
  if (!fontName) return false

  return document.fonts.check(`12px ${fontName}`)
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

    const fontFace = new FontFace(fontName, `url("${url}")`)

    document.fonts.add(fontFace)

    fontFace.load().then(() => (isMounted() ? setIsLoaded(true) : null))
  }, [fontName, isLoaded, isMounted, url])

  return isLoaded
}

export default function useFontData(font?: FamilyFont) {
  const url = useFontURL(font?.id, font?.fullName)
  const [parsed, setParsed] = useState<opentype.Font | null>()
  const isMounted = useIsMounted()

  useEffect(() => {
    if (!url || parsed) return

    fetch(url).then(async (res) => {
      const font = opentype.parse(await res.arrayBuffer())

      if (isMounted()) setParsed(font)
    })
  }, [isMounted, parsed, url])

  return parsed
}
