export type Base = {
  id: number
} & {
  [key: string]: number | string | null
}

export type WithoutId<T extends Base> = Omit<T, 'id'>
