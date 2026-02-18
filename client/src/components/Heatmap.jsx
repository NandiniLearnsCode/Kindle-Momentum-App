import { useState, useEffect } from 'react'

export default function Heatmap({ userId }) {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch(`/api/user/${userId}/heatmap`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
  }, [userId])

  if (!data.length) return null

  const getColor = (item) => {
    if (item.minutes === 0) return 'bg-kindle-black/60'
    if (item.completed) return 'bg-amazon-orange'
    return 'bg-amazon-teal/40'
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  }

  const totalDays = data.filter(d => d.minutes > 0).length
  const goalDays = data.filter(d => d.completed).length

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium text-kindle-dim uppercase tracking-widest">Last 30 Days</p>
        <p className="text-[11px] text-kindle-dim">
          <span className="text-amazon-orange font-semibold">{goalDays}</span> goals met · <span className="text-amazon-teal font-semibold">{totalDays}</span> days read
        </p>
      </div>
      <div className="grid grid-cols-10 gap-1.5">
        {data.map((item, i) => (
          <div key={i} className="group relative">
            <div
              className={`w-full aspect-square rounded-sm ${getColor(item)} transition-all duration-200 hover:scale-110 cursor-pointer`}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-kindle-surface text-[11px] text-kindle-text px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap border border-kindle-border">
                <p className="font-medium">{formatDate(item.date)}</p>
                <p className="text-kindle-muted">{item.minutes > 0 ? `${item.minutes} min` : 'No reading'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-kindle-dim">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-kindle-black/60" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amazon-teal/40" />
          <span>Read (under goal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amazon-orange" />
          <span>Goal met</span>
        </div>
      </div>
    </div>
  )
}
