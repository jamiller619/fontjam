import FontBase from './Font'

type Font = Pick<FontBase, 'id' | 'style' | 'postscriptName' | 'path'>

type Family = {
  libraryId: number
  name: string
  fonts: Font[]
}

export default Family
