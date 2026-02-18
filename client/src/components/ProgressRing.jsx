export default function ProgressRing({ current, goal, size = 110, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(current / goal, 1)
  const offset = circumference - progress * circumference
  const percentage = Math.round(progress * 100)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2E3340"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progress >= 1 ? '#FF9900' : '#00A8B5'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: progress >= 1 ? 'drop-shadow(0 0 6px rgba(255, 153, 0, 0.4))' : 'none'
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        {progress >= 1 ? (
          <span className="text-xl">✅</span>
        ) : (
          <span className="text-xl font-bold text-kindle-text leading-none">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  )
}
