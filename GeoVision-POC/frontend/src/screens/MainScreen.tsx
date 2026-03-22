import { useImagePicker } from '../hooks/useImagePicker'

interface Props {
  error?: string
  onFilePicked: (file: File) => void
  onViewHistory: () => void
}

export const MainScreen = ({ error, onFilePicked, onViewHistory }: Props) => {
  const { fileInputRef, cameraInputRef, triggerFilePicker, triggerCamera, onFileChange } =
    useImagePicker(onFilePicked)

  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-8 px-8 py-12"
      style={{ background: 'linear-gradient(160deg, #0bbfaa 0%, #00796b 100%)' }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-5xl font-bold text-white tracking-tight">GeoVision</h1>
        <p className="text-white/70 text-base">AI-powered location prediction</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={triggerCamera}
          className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-white text-[#00796b] font-semibold text-base shadow-md active:scale-95 transition-transform cursor-pointer"
        >
          <CameraIcon />
          Take a Photo
        </button>

        <button
          onClick={triggerFilePicker}
          className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-semibold text-base border border-white/30 active:scale-95 transition-transform cursor-pointer"
        >
          <UploadIcon />
          Upload a File
        </button>

        <button
          onClick={onViewHistory}
          className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-white/10 backdrop-blur-sm text-white/80 font-medium text-base active:scale-95 transition-transform cursor-pointer"
        >
          <HistoryIcon />
          View History
        </button>
      </div>

      {error && (
        <p className="text-red-200 text-sm text-center bg-red-500/20 rounded-xl px-4 py-2 max-w-xs">
          {error}
        </p>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
    </div>
  )
}

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="12 8 12 12 14 14" />
    <path d="M3.05 11a9 9 0 1 0 .5-4.5" />
    <polyline points="3 3 3 7 7 7" />
  </svg>
)
