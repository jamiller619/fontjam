export interface PreviewSlice {
  'preview.text': string
  'preview.size': number
  updatePreviewText: (text: string) => void
  updatePreviewSize: (size: number) => void
}

type SetState = (fn: (state: PreviewSlice) => Partial<PreviewSlice>) => void

export default function create(set: SetState): PreviewSlice {
  return {
    'preview.text': 'The quick brown fox jumps over the lazy dog',
    updatePreviewText: (text: string) => {
      set(() => ({
        'preview.text': text,
      }))
    },
    'preview.size': 72,
    updatePreviewSize: (size: number) => {
      set(() => ({
        'preview.size': size,
      }))
    },
  }
}
