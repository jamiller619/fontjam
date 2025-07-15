export type View = 'grid' | 'list'

export interface LibrarySlice {
  'library.active.id': number | null
  'library.filters.view': View
  setActiveLibrary: (id: number) => void
  setLibraryView: (view: View) => void
}

type SetState = (fn: (state: LibrarySlice) => Partial<LibrarySlice>) => void

export default function create(set: SetState): LibrarySlice {
  return {
    'library.active.id': null,
    setActiveLibrary: (id: number | null) => {
      set(() => ({
        'library.active.id': id,
      }))
    },
    'library.filters.view': 'grid',
    setLibraryView: (view: View) => {
      set(() => ({
        'library.filters.view': view,
      }))
    },
  }
}
