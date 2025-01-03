export interface ToolbarSlice {
  'toolbar.collapsed': boolean
  toggleToolbar: () => void
}

type SetState = (fn: (state: ToolbarSlice) => Partial<ToolbarSlice>) => void

export default function create(set: SetState): ToolbarSlice {
  return {
    'toolbar.collapsed': false,
    toggleToolbar: () => {
      set((state: ToolbarSlice) => ({
        'toolbar.collapsed': !state['toolbar.collapsed'],
      }))
    },
  }
}
