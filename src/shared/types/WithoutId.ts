export type Base = {
  id: number
} & {
  [key: string]: number | string | null
}

type WithoutId<T extends Base> = Omit<T, 'id'>

export default WithoutId
