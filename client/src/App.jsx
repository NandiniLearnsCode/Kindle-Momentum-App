import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import ReadTimer from './components/ReadTimer'
import Stats from './components/Stats'
import Settings from './components/Settings'
import BottomNav from './components/BottomNav'
import Onboarding from './components/Onboarding'

const USER_ID = 1

function App() {
  const [tab, setTab] = useState('home')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/${USER_ID}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setShowOnboarding(true)
      }
    } catch (e) {
      console.error('Failed to fetch user:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleSessionComplete = () => {
    fetchUser()
    setTab('home')
  }

  const handleResetDemo = async () => {
    await fetch('/api/reset', { method: 'POST' })
    await fetchUser()
    setShowSettings(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-kindle-black">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse-glow">📖</div>
          <p className="text-kindle-muted text-sm font-medium tracking-wide">KINDLE MOMENTUM</p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => { setShowOnboarding(false); fetchUser() }} />
  }

  return (
    <div className="min-h-screen bg-kindle-black flex flex-col items-center">
      <header className="sticky top-0 z-40 bg-kindle-black/95 backdrop-blur-md px-5 py-3 flex items-center justify-between w-full border-b border-kindle-border/50">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📖</span>
          <span className="text-base font-semibold text-kindle-text tracking-tight">kindle</span>
          <span className="text-base font-light text-amazon-orange tracking-tight">momentum</span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full hover:bg-kindle-card transition-colors text-kindle-muted hover:text-kindle-text"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      <main className="w-full max-w-lg px-4 py-4">
        {tab === 'home' && user && <Dashboard user={user} onRefresh={fetchUser} />}
        {tab === 'read' && user && <ReadTimer user={user} onComplete={handleSessionComplete} />}
        {tab === 'stats' && user && <Stats userId={USER_ID} />}
      </main>

      <BottomNav activeTab={tab} onTabChange={setTab} />

      {showSettings && (
        <Settings
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdate={fetchUser}
          onReset={handleResetDemo}
        />
      )}
    </div>
  )
}

export default App
