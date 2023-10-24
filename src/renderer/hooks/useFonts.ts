import opentype from 'opentype.js'
import { useEffect, useState } from 'react'
import { useSessionStorage } from 'usehooks-ts'

export type LocalFontData = Omit<FontData, 'blob'>

export const useFontFamily = (familyName?: string) => {
  const fonts = useFonts()
  const [family, setFamily] = useState<FontData[] | null>(null)
  const [font, setFont] = useState<opentype.Font | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (family)
      family[0]
        .blob()
        .then(async (data) => {
          const parsed = opentype.parse(await data.arrayBuffer())

          setFont(parsed)
        })
        .catch(setError)
  }, [family])

  useEffect(() => {
    if (family || !familyName) return

    const psNames = fonts[familyName].map((f) => f.postscriptName)

    window
      .queryLocalFonts({
        postscriptNames: psNames,
      })
      .then(setFamily)
  }, [family, familyName, fonts])

  return { font, error }
}

const mapFonts = (fonts: FontData[]) => {
  const mapped: LocalFontData[] = fonts.map((font) => ({
    family: font.family,
    fullName: font.fullName,
    postscriptName: font.postscriptName,
    style: font.style,
  }))

  return mapped
}

export default function useFonts() {
  const [fonts, setFonts] = useSessionStorage<Record<string, LocalFontData[]>>(
    'local-fonts',
    {}
  )

  useEffect(() => {
    if (Object.keys(fonts).length === 0) {
      const handleFonts = (fonts: FontData[]) => {
        const mapped = mapFonts(fonts)

        // @ts-ignore: this works, no idea how to fix it on
        // the typescript side
        setFonts(Object.groupBy(mapped, ({ family }) => family))
      }

      window.queryLocalFonts().then(handleFonts)
    }
  }, [fonts, setFonts])

  return fonts
}
