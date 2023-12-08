import { useEffect } from 'react'

type UseDragonDropConfig = {
  onFileDrop(files?: FileList): void
}

export default function useDragNDrop({ onFileDrop }: UseDragonDropConfig) {
  useEffect(() => {
    const dropHandler = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      onFileDrop(event.dataTransfer?.files)
    }

    const overHandler = (event: DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
    }

    document.addEventListener('drop', dropHandler)
    document.addEventListener('dragover', overHandler)

    return () => {
      document.removeEventListener('drop', dropHandler)
      document.removeEventListener('dragover', overHandler)
    }
  }, [onFileDrop])
}
