/**
 * This may not end up working...
 * If not, use this instead
 * ```ts
 * export type Webfont = {
 *   family: string
 *   variants: string[]
 *   subsets: string[]
 *   version: string
 *   lastModified: string
 *   files: Record<string, string>
 *   category: string
 *   kind: string
 *   menu: string
 * }
 */

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
