import { Library } from '@shared/types'
import TokenPath from '~/lib/TokenPath'

export function mapLibrary(data: Library) {
  const library: Library = {
    ...data,
    path: TokenPath.resolve(data.path),
  }

  return library
}
