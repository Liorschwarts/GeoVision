import { useRef } from 'react'

export const useImagePicker = (onFilePicked: (file: File) => void) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFilePicked(file)
    e.target.value = ''
  }

  return {
    fileInputRef,
    cameraInputRef,
    triggerFilePicker: () => fileInputRef.current?.click(),
    triggerCamera: () => cameraInputRef.current?.click(),
    onFileChange,
  }
}
