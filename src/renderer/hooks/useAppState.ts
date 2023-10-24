import { useLocalStorage } from 'usehooks-ts'

type AppState = {
  previewText: string
  previewFontSize: number
  view: 'grid' | 'list'
}

const defaultAppState = {
  previewText: 'The quick brown fox jumps over the lazy dog',
  previewFontSize: 18,
  view: 'grid',
} as const

// const pick = <T extends object, K extends keyof T>(obj: T, ...keys: K[]) => {
//   const res = {} as Pick<T, K>

//   keys.forEach((key) => {
//     res[key] = obj[key]
//   })

//   return res
// }

export default function useAppState() {
  const [state, setState] = useLocalStorage<AppState>(
    'appstate',
    defaultAppState
  )

  return [state, setState] as const
}
