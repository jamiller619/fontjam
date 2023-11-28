export type Webfont<T extends string[] = []> = {
  family: string
  variants: T
  subsets: string[]
  version: string
  lastModified: string
  files: Record<T[number], string>
  category: string
  kind: 'webfont#webfont'
  menu: string
}

export type WebfontList = {
  kind: 'webfonts#webfontList'
  items: Webfont[]
}
