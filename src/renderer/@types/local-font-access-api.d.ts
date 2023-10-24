declare global {
  interface Window {
    queryLocalFonts: (options?: QueryLocalFontOptions) => Promise<FontData[]>
  }

  type QueryLocalFontOptions = {
    postscriptNames?: string[]
  }

  type FontData = {
    family: string
    fullName: string
    postscriptName: string
    style: string
    blob(): Promise<Blob>
  }
}

export {}
