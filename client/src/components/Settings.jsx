import { useState } from 'react'

export default function Settings({ user, onClose, onUpdate, onReset }) {
  const [goal, setGoal] = useState(user.daily_goal_minutes)
  const [readingTime, setReadingTime] = useState(user.preferred_reading_time)
  const [saving, setSaving] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/user/${user.id}/update_settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        daily_goal_minutes: goal,
        preferred_reading_time: readingTime
      })
    })
    await onUpdate()
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-kindle-surface w-full max-w-lg rounded-t-2xl sm:rounded-xl p-6 max-h-[85vh] overflow-y-auto border border-kindle-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-kindle-text">Settings</h2>
          <button onClick={onClose} className="text-kindle-dim hover:text-kindle-text text-2xl leading-none">&times;</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[11px] font-medium text-kindle-dim mb-3 uppercase tracking-widest">
              Daily Reading Goal
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 15, 20, 25, 30, 45, 60].map(v => (
                <button
                  key={v}
                  onClick={() => setGoal(v)}
                  className={`py-3 rounded-lg text-sm font-semibold transition-all ${
                    goal === v
                      ? 'bg-amazon-orange text-kindle-black'
                      : 'bg-kindle-card border border-kindle-border text-kindle-text hover:border-amazon-orange/40'
                  }`}
                >
                  {v} min
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-kindle-dim mb-3 uppercase tracking-widest">
              Preferred Reading Time
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'morning', label: '🌅 Morning', sub: '6-10 AM' },
                { value: 'afternoon', label: '☀️ Afternoon', sub: '12-4 PM' },
                { value: 'evening', label: '🌙 Evening', sub: '6-10 PM' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setReadingTime(opt.value)}
                  className={`py-3 px-2 rounded-lg text-center transition-all ${
                    readingTime === opt.value
                      ? 'bg-amazon-teal text-white'
                      : 'bg-kindle-card border border-kindle-border text-kindle-text hover:border-amazon-teal/40'
                  }`}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-[10px] text-kindle-dim mt-1">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-amazon-orange hover:bg-amazon-orange-dark text-kindle-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          <div className="border-t border-kindle-border pt-6">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full bg-kindle-card border border-kindle-border text-kindle-muted hover:text-red-400 hover:border-red-400/30 font-medium py-3 rounded-lg transition-colors"
              >
                Reset Demo Data
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-400 text-center">This will reset all data to the demo state.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { onReset(); setShowResetConfirm(false) }}
                    className="flex-1 bg-red-500/15 border border-red-500/30 text-red-400 font-medium py-3 rounded-lg hover:bg-red-500/25 transition-colors"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-kindle-card border border-kindle-border text-kindle-text font-medium py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
