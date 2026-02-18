import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function Stats({ userId }) {
  const [stats, setStats] = useState(null)
  const weeklyRef = useRef(null)
  const monthlyRef = useRef(null)
  const weeklyChart = useRef(null)
  const monthlyChart = useRef(null)

  useEffect(() => {
    fetch(`/api/user/${userId}/stats`)
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
  }, [userId])

  useEffect(() => {
    if (!stats) return

    if (weeklyChart.current) weeklyChart.current.destroy()
    if (monthlyChart.current) monthlyChart.current.destroy()

    const chartColors = {
      text: '#8B919A',
      grid: '#2E334020',
      border: '#2E3340',
    }

    weeklyChart.current = new Chart(weeklyRef.current, {
      type: 'bar',
      data: {
        labels: stats.weekly.map(d => {
          const date = new Date(d.date + 'T12:00:00')
          return date.toLocaleDateString('en', { weekday: 'short' })
        }),
        datasets: [{
          label: 'Minutes',
          data: stats.weekly.map(d => d.minutes),
          backgroundColor: stats.weekly.map(d => d.minutes > 0 ? '#00A8B5' : '#2E3340'),
          borderRadius: 4,
          barThickness: 24,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: chartColors.text, font: { size: 11, family: 'Inter' } }, grid: { display: false }, border: { color: chartColors.border } },
          y: { ticks: { color: chartColors.text, font: { size: 11, family: 'Inter' } }, grid: { color: chartColors.grid }, border: { color: chartColors.border } }
        }
      }
    })

    monthlyChart.current = new Chart(monthlyRef.current, {
      type: 'bar',
      data: {
        labels: stats.monthly.map(d => d.week),
        datasets: [{
          label: 'Minutes',
          data: stats.monthly.map(d => d.minutes),
          backgroundColor: '#FF9900',
          borderRadius: 4,
          barThickness: 24,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: chartColors.text, font: { size: 10, family: 'Inter' } }, grid: { display: false }, border: { color: chartColors.border } },
          y: { ticks: { color: chartColors.text, font: { size: 11, family: 'Inter' } }, grid: { color: chartColors.grid }, border: { color: chartColors.border } }
        }
      }
    })

    return () => {
      if (weeklyChart.current) weeklyChart.current.destroy()
      if (monthlyChart.current) monthlyChart.current.destroy()
    }
  }, [stats])

  if (!stats) {
    return <div className="text-center text-kindle-muted py-12 text-sm">Loading stats...</div>
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon="📚" label="Sessions" value={stats.total_sessions} />
        <StatCard icon="⏱" label="Total Hours" value={stats.total_hours} />
        <StatCard icon="📊" label="Avg Session" value={`${stats.avg_session}m`} />
        <StatCard icon="🏆" label="Longest Streak" value={`${stats.longest_streak}d`} />
      </div>

      <div className="bg-kindle-card rounded-xl p-5 border border-kindle-border">
        <p className="text-[11px] font-medium text-kindle-dim uppercase tracking-widest mb-3">This Week</p>
        <div className="h-44">
          <canvas ref={weeklyRef} />
        </div>
      </div>

      <div className="bg-kindle-card rounded-xl p-5 border border-kindle-border">
        <p className="text-[11px] font-medium text-kindle-dim uppercase tracking-widest mb-3">Last 4 Weeks</p>
        <div className="h-44">
          <canvas ref={monthlyRef} />
        </div>
      </div>

      <div className="bg-kindle-card rounded-xl p-5 border border-kindle-border">
        <p className="text-[11px] font-medium text-kindle-dim uppercase tracking-widest mb-3">Personal Bests</p>
        <div className="space-y-3">
          <BestItem icon="🔥" label="Longest Streak" value={`${stats.longest_streak} days`} />
          <BestItem icon="📖" label="Longest Session" value={`${stats.longest_session} min`} />
          <BestItem icon="⚡" label="Best Week" value={`${stats.best_week_minutes} min`} />
        </div>
      </div>

      {stats.streak_history.length > 0 && (
        <div className="bg-kindle-card rounded-xl p-5 border border-kindle-border">
          <p className="text-[11px] font-medium text-kindle-dim uppercase tracking-widest mb-3">Streak History</p>
          <div className="space-y-2">
            {stats.streak_history.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-kindle-border/50 last:border-0">
                <div>
                  <p className="text-sm text-kindle-text font-medium">{s.length_days} days</p>
                  <p className="text-xs text-kindle-dim">
                    {new Date(s.start_date + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })} –{' '}
                    {new Date(s.end_date + 'T12:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className="text-amazon-orange text-lg">🔥</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-kindle-card rounded-xl p-4 border border-kindle-border text-center">
      <span className="text-lg">{icon}</span>
      <p className="text-2xl font-bold text-kindle-text mt-1">{value}</p>
      <p className="text-[10px] text-kindle-dim mt-1 uppercase tracking-wider">{label}</p>
    </div>
  )
}

function BestItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-sm text-kindle-muted">{label}</span>
      </div>
      <span className="text-sm font-bold text-kindle-text">{value}</span>
    </div>
  )
}
