import { useState, useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function ReadTimer({ user, onComplete }) {
  const [phase, setPhase] = useState('ready')
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [result, setResult] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (phase === 'running' && !paused) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [phase, paused])

  const startReading = () => {
    setPhase('running')
    setSeconds(0)
    setPaused(false)
  }

  const togglePause = () => {
    setPaused(p => !p)
  }

  const finishReading = async () => {
    clearInterval(intervalRef.current)
    const minutes = seconds / 60

    if (minutes < 0.1) {
      setPhase('ready')
      return
    }

    try {
      const res = await fetch(`/api/user/${user.id}/log_session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_minutes: Math.round(minutes * 10) / 10 })
      })
      const data = await res.json()
      setResult(data)
      setPhase('done')

      if (data.goal_met) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF9900', '#00A8B5', '#EAECEF']
        })
      }
    } catch (e) {
      console.error('Failed to log session:', e)
    }
  }

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const remainingForGoal = Math.max(0, (user.daily_goal_minutes - user.today_minutes) * 60)
  const progressToGoal = remainingForGoal > 0 ? Math.min(seconds / remainingForGoal, 1) : 1
  const remaining = Math.max(0, Math.round(user.daily_goal_minutes - user.today_minutes))

  if (phase === 'ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] animate-fade-in">
        <div className="bg-kindle-card rounded-xl border border-kindle-border p-8 w-full text-center space-y-6">
          <div>
            <div className="w-16 h-16 rounded-full bg-amazon-orange/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📖</span>
            </div>
            <h2 className="text-lg font-bold text-kindle-text">Log a Reading Session</h2>
            <p className="text-kindle-muted text-sm mt-2 leading-relaxed">
              Tap the button below when you start reading.<br />We'll track the time for you.
            </p>
          </div>

          <div className="bg-kindle-black/50 rounded-lg p-4">
            {user.today_minutes > 0 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-kindle-dim uppercase tracking-wider">Today so far</p>
                <p className="text-2xl font-bold text-amazon-teal">{Math.round(user.today_minutes)} min</p>
                {remaining > 0 && (
                  <p className="text-xs text-kindle-dim">{remaining} min left to reach your {user.daily_goal_minutes}-min goal</p>
                )}
                {remaining <= 0 && (
                  <p className="text-xs text-amazon-orange font-medium">Daily goal complete! Keep going?</p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[11px] text-kindle-dim uppercase tracking-wider">Daily goal</p>
                <p className="text-2xl font-bold text-kindle-text">{user.daily_goal_minutes} min</p>
                <p className="text-xs text-kindle-dim">No reading logged today yet</p>
              </div>
            )}
          </div>

          <button
            onClick={startReading}
            className="w-full bg-amazon-orange hover:bg-amazon-orange-dark text-kindle-black font-bold text-base py-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amazon-orange/15 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Reading
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] animate-fade-in">
        <div className="bg-kindle-card rounded-xl border border-kindle-border p-8 w-full text-center space-y-5">
          <span className="text-5xl block">{result?.goal_met ? '🎉' : '✅'}</span>
          <div>
            <h2 className="text-lg font-bold text-kindle-text">
              {result?.goal_met ? 'Daily Goal Complete!' : 'Session Logged!'}
            </h2>
            <p className="text-kindle-muted text-sm mt-1">Great job keeping up with your reading.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-kindle-black/50 rounded-lg p-3">
              <p className="text-[10px] text-kindle-dim uppercase tracking-wider">This session</p>
              <p className="text-xl font-bold text-amazon-teal mt-1">{formatTime(seconds)}</p>
            </div>
            <div className="bg-kindle-black/50 rounded-lg p-3">
              <p className="text-[10px] text-kindle-dim uppercase tracking-wider">Total today</p>
              <p className="text-xl font-bold text-kindle-text mt-1">{result?.today_total} min</p>
            </div>
          </div>

          {result?.streak_extended && (
            <div className="bg-amazon-orange/10 border border-amazon-orange/20 rounded-lg px-5 py-3 animate-streak-pop">
              <p className="text-amazon-orange font-semibold text-sm">
                🔥 Streak extended to {result.streak} days!
              </p>
            </div>
          )}

          <button
            onClick={() => { onComplete() }}
            className="w-full bg-amazon-teal hover:bg-amazon-teal-dark text-white font-semibold py-3.5 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-8 animate-fade-in">
      <div className="relative">
        <svg width="200" height="200" className="-rotate-90">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#2E3340" strokeWidth="6" />
          <circle
            cx="100" cy="100" r="90" fill="none"
            stroke={progressToGoal >= 1 ? '#FF9900' : '#00A8B5'}
            strokeWidth="6"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={2 * Math.PI * 90 * (1 - progressToGoal)}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold text-kindle-text tracking-wider">
            {formatTime(seconds)}
          </span>
          {paused && <span className="text-amazon-orange text-xs font-medium mt-2">Paused</span>}
          {!paused && <span className="text-kindle-dim text-xs mt-2">Reading...</span>}
        </div>
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={togglePause}
          className="flex-1 bg-kindle-card hover:bg-kindle-hover border border-kindle-border text-kindle-text font-semibold py-4 rounded-lg transition-colors text-sm"
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          onClick={finishReading}
          className="flex-1 bg-amazon-orange hover:bg-amazon-orange-dark text-kindle-black font-bold py-4 rounded-lg transition-colors text-sm"
        >
          ✓ Done
        </button>
      </div>
    </div>
  )
}
