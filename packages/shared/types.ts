export type FontStyle = 'regular' | 'italic' | 'monospace'

export type Font = {
  fullName: string
  style: string

  postscriptName: string | null
  // A number value between 1 and 1000, inclusive
  weight: number | null
}

export type FontFamily = {
  fonts: Font[]
  name: string

  copyright: string | null
  designer: string | null
  license: string | null
  popularity: number | null
  tags: string[] | null
}
