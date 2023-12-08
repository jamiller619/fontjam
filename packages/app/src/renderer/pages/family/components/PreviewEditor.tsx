import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

type PreviewEditorProps = {
  value: string
  onValueChange: (newValue: string) => unknown
}

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker()
  },
}

loader.config({ monaco })

await loader.init()

export default function PreviewEditor({
  value,
  onValueChange,
}: PreviewEditorProps) {
  return (
    <Editor
      theme="vs-dark"
      height="70vh"
      defaultLanguage="markdown"
      value={value}
      onChange={(val) => onValueChange(val ?? '')}
    />
  )
}
