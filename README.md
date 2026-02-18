# Kindle Momentum

A Reading Streaks & Momentum Engine built as a prototype for Amazon Books. Kindle Momentum is a habit-building tool that helps Kindle readers maintain daily reading streaks through gamification, adaptive goals, smart nudges, and streak shields.

## What It Does

Kindle Momentum turns reading into a rewarding daily habit by tracking your reading time and building streaks — similar to how fitness apps motivate you to exercise every day.

### Core Features

- **Reading Streaks** — Track consecutive days of reading with a satisfying flame counter and animations. Miss a day? Your streak resets (unless you have a shield).

- **Daily Progress Ring** — A circular progress indicator shows how close you are to hitting your daily reading goal.

- **Reading Timer** — Tap "Start Reading" when you pick up your book, and tap "Done" when you finish. Your session is logged automatically.

- **30-Day Heatmap** — A color-coded calendar showing your last 30 days of reading at a glance. Orange means you hit your goal, teal means you read but fell short, and dark means you missed the day.

- **Streak Shields** — Earn protective shields by maintaining 7-day streaks (up to 3 shields max). If you miss a day, a shield is consumed automatically to keep your streak alive.

- **Adaptive Goal Suggestions** — The app analyzes your reading patterns and suggests goal adjustments. If you're consistently exceeding your goal, it nudges you to raise it. If you're struggling, it suggests lowering it.

- **Smart Nudges** — Context-aware reminders based on your preferred reading time, current streak status, and recent activity.

- **Stats Dashboard** — Charts showing weekly and monthly reading trends, personal bests, and streak history.

- **Confetti Celebrations** — Hit your daily goal and get a confetti animation to celebrate!

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Backend**: Python Flask, SQLite
- **Charts**: Chart.js
- **Design**: Custom Kindle-inspired dark mode with Amazon's signature orange and teal accents

## Design

The app uses a near-black color palette inspired by Kindle's dark mode reading experience, with Amazon's orange (#FF9900) as the primary accent color. It's designed mobile-first with a bottom navigation bar, card-based layouts, and smooth animations throughout.

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+

### Setup

1. **Install backend dependencies:**
   ```bash
   pip install flask flask-cors
   ```

2. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Start the backend server:**
   ```bash
   python server/app.py
   ```

4. **Start the frontend dev server:**
   ```bash
   cd client
   npm run dev
   ```

The app comes pre-seeded with 45 days of realistic demo reading data, including a 15-day active streak, so you can explore all the features right away. Use the "Reset Demo Data" button in Settings to restore the demo data at any time.
