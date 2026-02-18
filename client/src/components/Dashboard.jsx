import { useState, useEffect } from 'react'
import ProgressRing from './ProgressRing'
import Heatmap from './Heatmap'

export default function Dashboard({ user, onRefresh }) {
  const [nudge, setNudge] = useState(null)
  const [goalSuggestion, setGoalSuggestion] = useState(null)

  useEffect(() => {
    fetch(`/api/user/${user.id}/nudge`)
      .then(r => r.json())
      .then(setNudge)
      .catch(console.error)

    fetch(`/api/user/${user.id}/goal_suggestion`)
      .then(r => r.json())
      .then(setGoalSuggestion)
      .catch(console.error)
  }, [user.id])

  const handleAcceptGoal = async () => {
    if (!goalSuggestion?.id) return
    await fetch(`/api/user/${user.id}/accept_goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment_id: goalSuggestion.id })
    })
    setGoalSuggestion(null)
    onRefresh()
  }

  const handleDismissGoal = async () => {
    if (!goalSuggestion?.id) return
    await fetch(`/api/user/${user.id}/dismiss_goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment_id: goalSuggestion.id })
    })
    setGoalSuggestion(null)
  }

  const greetingText = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const remaining = Math.max(0, Math.round(user.daily_goal_minutes - user.today_minutes))

  return (
    <div className="space-y-4">
      <div className="pt-1 pb-1 animate-fade-in">
        <p className="text-kindle-muted text-sm">{greetingText()}, <span className="text-kindle-text font-medium">{user.name}</span></p>
      </div>

      {nudge && (
        <div className={`rounded-xl p-4 animate-fade-in border ${
          nudge.type === 'urgent'
            ? 'bg-amazon-orange/8 border-amazon-orange/20'
            : 'bg-amazon-teal/8 border-amazon-teal/20'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl flex-shrink-0">{nudge.type === 'urgent' ? '⚡' : '📚'}</span>
            <p className="text-sm text-kindle-text/90 leading-snug">{nudge.message}</p>
          </div>
        </div>
      )}

      <div className="bg-kindle-card rounded-xl p-5 animate-fade-in border border-kindle-border">
        <div className="flex items-center gap-5">
          <div className="flex-shrink-0">
            <ProgressRing current={user.today_minutes} goal={user.daily_goal_minutes} size={110} strokeWidth={8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-kindle-dim uppercase tracking-widest mb-1.5">Today's Progress</p>
            {user.today_minutes >= user.daily_goal_minutes ? (
              <p className="text-amazon-orange font-semibold text-lg">Goal complete!</p>
            ) : user.today_minutes > 0 ? (
              <p className="text-kindle-text text-base"><span className="font-bold">{remaining} min</span> <span className="text-kindle-muted">left</span></p>
            ) : (
              <p className="text-kindle-muted text-base">No reading yet. <span className="font-semibold text-kindle-text">{user.daily_goal_minutes} min</span> to go.</p>
            )}
            <p className="text-kindle-dim text-xs mt-2">Daily goal: {user.daily_goal_minutes} min</p>
          </div>
        </div>
      </div>

      <div className="bg-kindle-card rounded-xl p-5 text-center animate-fade-in border border-kindle-border" style={{animationDelay: '0.05s'}}>
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-3xl animate-pulse-glow">🔥</span>
          <span className="text-5xl font-black text-amazon-orange animate-streak-pop">
            {user.current_streak}
          </span>
          <span className="text-kindle-dim text-sm font-medium self-end mb-1.5">day{user.current_streak !== 1 ? 's' : ''}</span>
        </div>
        <p className="text-kindle-dim text-[11px] font-medium uppercase tracking-widest mb-4">Current Streak</p>

        <div className="flex items-stretch gap-3">
          <div className="bg-kindle-black/50 rounded-lg px-4 py-3 flex-1">
            <p className="text-[10px] text-kindle-dim mb-1 uppercase tracking-wider">Best</p>
            <p className="text-lg font-bold text-amazon-teal">🏆 {user.longest_streak}<span className="text-[10px] font-normal text-kindle-dim ml-1">days</span></p>
          </div>
          <div className="bg-kindle-black/50 rounded-lg px-4 py-3 flex-1">
            <p className="text-[10px] text-kindle-dim mb-1 uppercase tracking-wider">Shields</p>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              {[0, 1, 2].map(i => (
                <span key={i} className={`text-lg ${i < user.shields_available ? '' : 'opacity-20'}`}>
                  🛡️
                </span>
              ))}
            </div>
            <p className="text-[9px] text-kindle-dim mt-1">Protects missed days</p>
          </div>
        </div>
      </div>

      {goalSuggestion && (
        <div className="bg-kindle-card rounded-xl p-4 animate-fade-in border border-amazon-orange/15" style={{animationDelay: '0.1s'}}>
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">🎯</span>
            <div className="flex-1">
              <p className="text-[10px] text-kindle-dim uppercase tracking-widest font-semibold mb-1">Goal Suggestion</p>
              <p className="text-sm text-kindle-text/90 leading-snug mb-3">{goalSuggestion.reason}</p>
              <div className="flex gap-2">
                <button
                  onClick={handleAcceptGoal}
                  className="flex-1 bg-amazon-orange hover:bg-amazon-orange-dark text-kindle-black text-sm font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Update Goal
                </button>
                <button
                  onClick={handleDismissGoal}
                  className="flex-1 bg-kindle-border/50 hover:bg-kindle-border text-kindle-text text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  Keep Current
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-kindle-card rounded-xl p-5 animate-fade-in border border-kindle-border" style={{animationDelay: '0.15s'}}>
        <Heatmap userId={user.id} />
      </div>
    </div>
  )
}
