export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
        </svg>
      ),
    },
    {
      id: 'read',
      label: 'Read',
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-kindle-black/95 backdrop-blur-md border-t border-kindle-border/50">
      <div className="max-w-lg mx-auto flex justify-around py-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg transition-all duration-200 ${
              activeTab === t.id
                ? 'text-amazon-orange'
                : 'text-kindle-dim hover:text-kindle-muted'
            }`}
          >
            {t.icon(activeTab === t.id)}
            <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
