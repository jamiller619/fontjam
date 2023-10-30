import { Font } from '@shared/types'

declare global {
  interface Window {
    queryLocalFonts: (options?: QueryLocalFontOptions) => Promise<FontData[]>
  }

  type QueryLocalFontOptions = {
    postscriptNames?: string[]
  }

  type FontData = Omit<Font, 'id' | 'libraryId' | 'path'> & {
    blob(): Promise<Blob>
  }
}

export {}
