import { useState } from 'react'

export default function Onboarding({ onComplete }) {
  const [goal, setGoal] = useState(20)
  const [readingTime, setReadingTime] = useState('evening')

  const handleSubmit = async () => {
    await fetch('/api/reset', { method: 'POST' })
    await fetch('/api/user/1/update_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daily_goal_minutes: goal,
        preferred_reading_time: readingTime
      })
    })
    onComplete()
  }

  return (
    <div className="min-h-screen bg-kindle-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <span className="text-5xl mb-4 block">📖</span>
          <div className="mb-2">
            <span className="text-2xl font-semibold text-kindle-text tracking-tight">kindle</span>
            <span className="text-2xl font-light text-amazon-orange tracking-tight ml-1">momentum</span>
          </div>
          <p className="text-kindle-muted text-sm">Build your reading habit, one day at a time.</p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-kindle-dim mb-3 uppercase tracking-widest">Set your daily goal</p>
          <div className="grid grid-cols-4 gap-3">
            {[10, 15, 20, 25].map(v => (
              <button
                key={v}
                onClick={() => setGoal(v)}
                className={`py-4 rounded-lg text-lg font-bold transition-all ${
                  goal === v
                    ? 'bg-amazon-orange text-kindle-black scale-105'
                    : 'bg-kindle-card border border-kindle-border text-kindle-text'
                }`}
              >
                {v}m
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-medium text-kindle-dim mb-3 uppercase tracking-widest">When do you like to read?</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'morning', label: '🌅', name: 'Morning' },
              { value: 'afternoon', label: '☀️', name: 'Afternoon' },
              { value: 'evening', label: '🌙', name: 'Evening' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setReadingTime(opt.value)}
                className={`py-4 rounded-lg text-center transition-all ${
                  readingTime === opt.value
                    ? 'bg-amazon-teal text-white scale-105'
                    : 'bg-kindle-card border border-kindle-border text-kindle-text'
                }`}
              >
                <div className="text-2xl">{opt.label}</div>
                <div className="text-xs mt-1 font-medium">{opt.name}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-amazon-orange hover:bg-amazon-orange-dark text-kindle-black font-bold text-lg py-4 rounded-lg transition-all hover:scale-[1.02] active:scale-95"
        >
          Start My Streak 🔥
        </button>
      </div>
    </div>
  )
}
