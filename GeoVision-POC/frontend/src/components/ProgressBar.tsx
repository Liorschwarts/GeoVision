interface Props {
  progress: number
}

export const ProgressBar = ({ progress }: Props) => (
  <div className="w-full flex flex-col gap-1">
    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-teal-500 rounded-full transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
    <span className="text-xs text-gray-400 text-center">{progress}%</span>
  </div>
)
