const MAX_DIMENSION = 2048
const MAX_BYTES = 9 * 1024 * 1024
const INITIAL_QUALITY = 0.85

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read image'))
    }
    img.src = url
  })
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode image'))),
      'image/jpeg',
      quality,
    )
  })
}

/** Resize and re-encode phone camera photos (often HEIC and several MB) for upload. */
export async function prepareImageForUpload(file: File): Promise<File> {
  const img = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight))
  const width = Math.round(img.naturalWidth * scale)
  const height = Math.round(img.naturalHeight * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)

  let quality = INITIAL_QUALITY
  let blob = await canvasToJpeg(canvas, quality)
  while (blob.size > MAX_BYTES && quality > 0.5) {
    quality -= 0.1
    blob = await canvasToJpeg(canvas, quality)
  }

  const name = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified })
}
