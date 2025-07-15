import opentype from 'opentype.js'
import { useEffect, useState } from 'react'
import { useIsMounted } from 'usehooks-ts'
import { Font } from '@shared/types/dto'
import { slugify } from '@shared/utils/string'

/**
 * Generates a custom font URL for loading fonts from font
 * server in main.
 *
 * @param {number} [fontId] - The unique identifier for the font
 * @param {string} [fontName] - The name of the font to be slugified for the URL
 * @returns {string | undefined} The generated font URL or undefined if required parameters are missing
 *
 * @example
 * const url = useFontURL(123, "Arial Bold");
 * // Returns: "font://localhost/arial-bold?id=123"
 */
export function useFontURL(
  fontId?: number,
  fontName?: string,
): string | undefined {
  if (!fontId || !fontName) return undefined

  const slug = slugify(fontName)
  const url = `font://localhost/${slug}?id=${fontId}`

  return url
}

/**
 * Loads a font face into the document's font collection using the CSS Font Loading API.
 *
 * @param {string} [fontName] - The name to register the font under
 * @param {string} [fontURL] - The URL to load the font from
 * @returns {Promise<boolean | Error | undefined>} Promise that resolves to true on success,
 *   Error object on failure, or undefined if parameters are missing
 *
 * @example
 * const result = await loadFontFace("MyFont", "font://localhost/my-font?id=123");
 * if (result === true) {
 *   console.log("Font loaded successfully");
 * } else if (result instanceof Error) {
 *   console.error("Font loading failed:", result.message);
 * }
 */
async function loadFontFace(
  fontName?: string,
  fontURL?: string,
): Promise<boolean | Error | undefined> {
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

/**
 * Generates a PostScript font name by combining family and font names.
 *
 * @param {string | null} [psFamilyName] - The PostScript family name
 * @param {string | null} [psFontName] - The PostScript font name (style/weight)
 * @returns {string | undefined} The combined PostScript name or undefined if family name is missing
 *
 * @example
 * getPostscriptName("Arial", "Bold"); // Returns: "Arial-Bold"
 * getPostscriptName("Arial", null); // Returns: "Arial"
 * getPostscriptName(null, "Bold"); // Returns: undefined
 */
function getPostscriptName(
  psFamilyName?: string | null,
  psFontName?: string | null,
): string | undefined {
  if (!psFamilyName?.trim()) {
    return undefined
  }

  if (!psFontName?.trim()) {
    return psFamilyName
  }

  return `${psFamilyName}-${psFontName}`
}

/**
 * Hook that generates a PostScript-compatible font name for use in CSS.
 * Falls back to constructing a name from font properties if PostScript names are unavailable.
 *
 * @param {string | null} [postscriptFamilyName] - The PostScript family name
 * @param {Font} [font] - The font object containing metadata
 * @returns {string | undefined} The generated PostScript name or undefined if font is missing
 *
 * @example
 * const psName = usePostScriptName("Arial", fontObject);
 * // Returns: "Arial-Bold" or falls back to "Arial Bold 700"
 */
export function usePostScriptName(
  postscriptFamilyName?: string | null,
  font?: Font,
): string | undefined {
  if (!font) return undefined

  const psName = getPostscriptName(
    postscriptFamilyName,
    font.postscriptFontName,
  )

  if (psName?.trim() != null) {
    return psName.trim()
  }

  return [font.fullName, font.weight ? null : font.style, font.weight]
    .filter(Boolean)
    .join(' ')
}

/**
 * React hook that loads a font face into the document and tracks its loading state.
 *
 * @param {Font} [font] - The font object containing metadata
 * @param {string | null} [postscriptFamilyName] - The PostScript family name
 * @returns {boolean | Error} Returns true if loaded successfully, Error object if failed,
 *   or false if still loading/not started
 *
 * @example
 * const loadState = useFontFace(fontObject, "Arial");
 * if (loadState === true) {
 *   // Font is ready to use
 * } else if (loadState instanceof Error) {
 *   // Handle error
 * } else {
 *   // Still loading
 * }
 */
export function useFontFace(
  font?: Font,
  postscriptFamilyName?: string | null,
): boolean | Error {
  const fontName = usePostScriptName(postscriptFamilyName, font)
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

/**
 * React hook that fetches and parses a font file using OpenType.js.
 * Provides access to detailed font metadata and glyph information.
 *
 * @param {number} [id] - The unique identifier for the font
 * @param {string} [name] - The name of the font
 * @returns {opentype.Font | null} The parsed OpenType font object or null if not loaded
 *
 * @example
 * const fontData = useOpenTypeFont(123, "Arial Bold");
 * if (fontData) {
 *   console.log("Font family:", fontData.names.fontFamily);
 *   console.log("Glyph count:", fontData.glyphs.length);
 * }
 */
export default function useOpenTypeFont(
  id?: number,
  name?: string,
): opentype.Font | null {
  const url = useFontURL(id, name)
  const [fontData, setFontData] = useState<opentype.Font | null>(null)

  useEffect(() => {
    if (!url || fontData) return

    const controller = new AbortController()

    fetch(url, {
      signal: controller.signal,
    })
      .then(async function fetchResponse(res) {
        if (!res.ok) return

        const data = await res.arrayBuffer()

        const font = opentype.parse(data)

        setFontData(font)
      })
      .catch((err) => console.error(err))

    return () => controller.abort('Component unmounted')
  }, [fontData, url])

  return fontData
}
