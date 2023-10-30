import { useEffect, useMemo } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import useAPI from './useAPI'

export type StorableFontData = Omit<FontData, 'blob'>

const mapFonts = (fonts: FontData[]) => {
  const mapped: StorableFontData[] = fonts.map((font) => ({
    family: font.family,
    fullName: font.fullName,
    postscriptName: font.postscriptName,
    style: font.style,
  }))

  return mapped
}

export function useLibraryFonts(id?: string) {
  const library = useLibrary(id)
  const [fonts, setFonts] = useSessionStorage<
    Record<string, StorableFontData[]>
  >(`library.${id ?? 0}.fonts`, {})

  useEffect(() => {
    if (!library) return
    if (Object.keys(fonts).length > 0) return

    if (library.name === 'System') {
      window.queryLocalFonts().then((fonts) => {
        const mapped = mapFonts(fonts)

        // @ts-ignore: this works, no idea how to fix it on
        // the typescript side
        setFonts(Object.groupBy(mapped, ({ family }) => family))
      })
    }
  }, [fonts, library, setFonts])

  return { fonts, library } as const
}

export default function useLibrary(id?: string) {
  const { data: libraries } = useAPI('get.libraries')

  return useMemo(() => {
    if (id == null) {
      return libraries?.records.find((lib) => lib.name === 'System')
    }

    return libraries?.records.find((lib) => lib.id === id)
  }, [id, libraries?.records])
}
