# Kindle Momentum

## Overview
A Reading Streaks & Momentum Engine prototype for Amazon Books. This is a habit-building tool that helps Kindle readers maintain daily reading streaks with adaptive goals, smart nudges, and streak shields.

## Architecture
- **Backend**: Python Flask (port 8000), SQLite database
- **Frontend**: React + Vite (port 5000), Tailwind CSS v4
- **Database**: SQLite at `server/kindle_momentum.db`

## Project Structure
```
server/
  app.py          - Flask backend with all API endpoints and data models
client/
  src/
    App.jsx       - Main app component with routing
    index.css     - Global styles, Kindle design system, animations
    components/
      Dashboard.jsx   - Home screen with streak, progress, heatmap
      ReadTimer.jsx   - Reading session timer with confetti
      Stats.jsx       - Charts and personal bests
      Settings.jsx    - Settings modal
      Onboarding.jsx  - First-time setup
      BottomNav.jsx   - Bottom navigation bar
      ProgressRing.jsx - Circular progress indicator
      Heatmap.jsx     - 30-day reading calendar
```

## Key Features
1. Streak counter with flame animation
2. Circular progress ring for daily goal
3. 30-day heatmap calendar
4. Reading timer with confetti celebration
5. Adaptive goal suggestions
6. Smart nudge system
7. Stats with Chart.js bar charts
8. Streak shields mechanic
9. Settings & demo reset

## Tech Stack
- Flask + Flask-CORS
- React 19 + Vite 7
- Tailwind CSS v4 (@tailwindcss/vite)
- Chart.js + react-chartjs-2
- canvas-confetti
- Inter font (Google Fonts)

## Kindle Design System
Color palette (defined in index.css @theme):
- **kindle-black**: #0F1114 (near-black background)
- **kindle-surface**: #1A1D23 (modal/overlay bg)
- **kindle-card**: #22262E (card background)
- **kindle-border**: #2E3340 (borders)
- **kindle-hover**: #333844 (hover states)
- **amazon-orange**: #FF9900 (primary accent)
- **amazon-teal**: #00A8B5 (secondary accent)
- **kindle-text**: #EAECEF (primary text)
- **kindle-muted**: #8B919A (secondary text)
- **kindle-dim**: #5A6170 (tertiary/label text)

## Workflows
- Backend Server: `python server/app.py` (port 8000)
- Frontend Dev: `npm run dev` in client/ (port 5000, proxies /api to 8000)

## User Preferences
- Dark mode by default
- Mobile-first responsive design
- Amazon/Kindle-inspired aesthetic with near-black backgrounds
