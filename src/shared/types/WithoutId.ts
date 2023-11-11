export type Base = {
  id: number
}

type WithoutId<T extends Base> = Omit<T, 'id'>

export default WithoutId
