import FontBase from './Font'

export type FamilyFont = Omit<FontBase, 'libraryId' | 'family'>

type Family = {
  libraryId: number
  name: string
  fonts: FamilyFont[]
}

export default Family
