import { Library } from '@shared/types'
import { LocalProvider } from './providers'

// const providers = [new LocalProvider(), new
// GoogleFontsProvider()]
const providers = [new LocalProvider()]

export default async function init(libraries: Library[]) {
  for await (const library of libraries) {
    const provider = providers.find((p) => p.match(library))

    if (provider != null) {
      await provider.init(library)
    }
  }
}
