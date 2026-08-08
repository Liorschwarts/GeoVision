import { useId } from 'react'

export const useImagePicker = (onFilePicked: (file: File) => void) => {
  const fileInputId = useId()
  const cameraInputId = useId()

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFilePicked(file)
    e.target.value = ''
  }

  return {
    fileInputId,
    cameraInputId,
    onFileChange,
  }
}
