export interface MenuSlice {
  'menu.open': boolean
  toggleMenu: () => void
}

type SetState = (fn: (state: MenuSlice) => Partial<MenuSlice>) => void

export default function create(set: SetState): MenuSlice {
  return {
    'menu.open': true,
    toggleMenu: () => {
      set((state: MenuSlice) => ({
        'menu.open': !state['menu.open'],
      }))
    },
  }
}
