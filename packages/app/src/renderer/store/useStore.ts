import { create } from 'zustand'
import createLibrarySlice, { type LibrarySlice } from './slices/library'
import createMenuSlice, { type MenuSlice } from './slices/menu'
import createPreviewSlice, { type PreviewSlice } from './slices/preview'
import createToolbarSlice, { type ToolbarSlice } from './slices/toolbar'

export type Store = PreviewSlice & MenuSlice & LibrarySlice & ToolbarSlice

const useStore = create<Store>((set) => ({
  ...createLibrarySlice(set),
  ...createMenuSlice(set),
  ...createPreviewSlice(set),
  ...createToolbarSlice(set),
}))

export default useStore
