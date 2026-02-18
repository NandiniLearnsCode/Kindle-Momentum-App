import sqlite3
import os
from datetime import datetime, timedelta
import random
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='../client/dist', static_url_path='')
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'kindle_momentum.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            daily_goal_minutes INTEGER DEFAULT 20,
            preferred_reading_time TEXT DEFAULT 'evening',
            shields_available INTEGER DEFAULT 0,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            streak_start_date TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS reading_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            start_time TEXT,
            duration_minutes REAL NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS streak_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            length_days INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS goal_adjustments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            old_goal INTEGER NOT NULL,
            new_goal INTEGER NOT NULL,
            reason TEXT,
            suggested_at TEXT DEFAULT (datetime('now')),
            accepted INTEGER DEFAULT 0,
            dismissed INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    ''')
    conn.commit()
    conn.close()

def seed_mock_data():
    conn = get_db()
    conn.execute("DELETE FROM reading_sessions")
    conn.execute("DELETE FROM streak_history")
    conn.execute("DELETE FROM goal_adjustments")
    conn.execute("DELETE FROM users")

    goal = 25
    conn.execute('''INSERT INTO users (id, name, daily_goal_minutes, preferred_reading_time, shields_available, current_streak, longest_streak, streak_start_date)
        VALUES (1, 'Demo Reader', ?, 'evening', 2, 12, 18, ?)''',
        (goal, (datetime.now() - timedelta(days=11)).strftime('%Y-%m-%d'),))

    today = datetime.now().date()
    sessions = []

    missed_days_ago = {14, 15, 33}
    shield_used_ago = set()

    for i in range(45, 0, -1):
        day = today - timedelta(days=i)
        date_str = day.strftime('%Y-%m-%d')

        if i in missed_days_ago:
            continue

        if i in shield_used_ago:
            continue

        base = random.uniform(26, 35) if i <= 12 else random.uniform(20, 33)
        duration = round(max(15, min(35, base)), 1)
        if i <= 12:
            duration = max(goal, duration)
        hour = random.choice([7, 8, 12, 13, 19, 20, 21])
        start = datetime.combine(day, datetime.min.time()) + timedelta(hours=hour, minutes=random.randint(0, 59))
        sessions.append((1, start.isoformat(), duration, date_str))

    conn.executemany('INSERT INTO reading_sessions (user_id, start_time, duration_minutes, date) VALUES (?, ?, ?, ?)', sessions)

    conn.execute('''INSERT INTO streak_history (user_id, start_date, end_date, length_days)
        VALUES (1, ?, ?, 18)''',
        ((today - timedelta(days=44)).strftime('%Y-%m-%d'), (today - timedelta(days=27)).strftime('%Y-%m-%d')))

    conn.execute('''INSERT INTO streak_history (user_id, start_date, end_date, length_days)
        VALUES (1, ?, ?, 10)''',
        ((today - timedelta(days=25)).strftime('%Y-%m-%d'), (today - timedelta(days=16)).strftime('%Y-%m-%d')))

    conn.commit()
    conn.close()

def compute_streak(user_id):
    conn = get_db()
    today = datetime.now().date()
    user = dict(conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone())
    goal = user['daily_goal_minutes']
    shields = user['shields_available']

    sessions = conn.execute(
        'SELECT date, SUM(duration_minutes) as total FROM reading_sessions WHERE user_id = ? GROUP BY date ORDER BY date DESC',
        (user_id,)
    ).fetchall()

    session_map = {row['date']: row['total'] for row in sessions}
    today_str = today.strftime('%Y-%m-%d')
    today_met = today_str in session_map and session_map[today_str] >= goal

    streak = 0
    shields_used = 0
    check_date = today if today_met else today - timedelta(days=1)
    shield_message = None

    while True:
        d = check_date.strftime('%Y-%m-%d')
        if d in session_map and session_map[d] >= goal:
            streak += 1
            check_date -= timedelta(days=1)
        elif shields_used < shields and streak > 0:
            shields_used += 1
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    if shields_used > 0:
        new_shields = shields - shields_used
        conn.execute('UPDATE users SET shields_available = ? WHERE id = ?', (new_shields, user_id))
        shield_message = f"Shield used! Your {streak}-day streak lives on 🛡️"

    new_shields_earned = streak // 7
    current_shields = shields - shields_used
    if new_shields_earned > 0 and current_shields < 3:
        bonus = min(3 - current_shields, new_shields_earned)
        conn.execute('UPDATE users SET shields_available = MIN(3, shields_available + ?) WHERE id = ?', (bonus, user_id))

    conn.execute('UPDATE users SET current_streak = ?, longest_streak = MAX(longest_streak, ?) WHERE id = ?',
                 (streak, streak, user_id))
    conn.commit()
    conn.close()
    return streak

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404

    streak = compute_streak(user_id)
    user = dict(conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone())

    today = datetime.now().date().strftime('%Y-%m-%d')
    today_reading = conn.execute(
        'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM reading_sessions WHERE user_id = ? AND date = ?',
        (user_id, today)
    ).fetchone()

    conn.close()
    user['today_minutes'] = round(today_reading['total'], 1)
    user['current_streak'] = streak
    return jsonify(user)

@app.route('/api/user/<int:user_id>/heatmap', methods=['GET'])
def get_heatmap(user_id):
    conn = get_db()
    today = datetime.now().date()
    start = today - timedelta(days=29)
    sessions = conn.execute(
        'SELECT date, SUM(duration_minutes) as total FROM reading_sessions WHERE user_id = ? AND date >= ? GROUP BY date',
        (user_id, start.strftime('%Y-%m-%d'))
    ).fetchall()
    user = conn.execute('SELECT daily_goal_minutes FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()

    session_map = {row['date']: round(row['total'], 1) for row in sessions}
    goal = user['daily_goal_minutes']
    heatmap = []
    for i in range(30):
        d = (start + timedelta(days=i)).strftime('%Y-%m-%d')
        mins = session_map.get(d, 0)
        heatmap.append({
            'date': d,
            'minutes': mins,
            'completed': mins >= goal
        })
    return jsonify(heatmap)

@app.route('/api/user/<int:user_id>/sessions', methods=['GET'])
def get_sessions(user_id):
    conn = get_db()
    sessions = conn.execute(
        'SELECT * FROM reading_sessions WHERE user_id = ? ORDER BY date DESC LIMIT 50',
        (user_id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(s) for s in sessions])

@app.route('/api/user/<int:user_id>/log_session', methods=['POST'])
def log_session(user_id):
    data = request.json
    duration = data.get('duration_minutes', 0)
    if duration <= 0:
        return jsonify({'error': 'Invalid duration'}), 400

    conn = get_db()
    today = datetime.now()
    date_str = today.date().strftime('%Y-%m-%d')

    conn.execute(
        'INSERT INTO reading_sessions (user_id, start_time, duration_minutes, date) VALUES (?, ?, ?, ?)',
        (user_id, today.isoformat(), round(duration, 1), date_str)
    )
    conn.commit()

    user = dict(conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone())
    today_total = conn.execute(
        'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM reading_sessions WHERE user_id = ? AND date = ?',
        (user_id, date_str)
    ).fetchone()['total']

    goal_met = today_total >= user['daily_goal_minutes']
    conn.close()
    streak = compute_streak(user_id)

    return jsonify({
        'goal_met': goal_met,
        'today_total': round(today_total, 1),
        'streak': streak,
        'streak_extended': goal_met
    })

@app.route('/api/user/<int:user_id>/goal_suggestion', methods=['GET'])
def get_goal_suggestion(user_id):
    conn = get_db()
    user = dict(conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone())
    goal = user['daily_goal_minutes']

    today = datetime.now().date()
    last_14 = conn.execute(
        'SELECT date, SUM(duration_minutes) as total FROM reading_sessions WHERE user_id = ? AND date >= ? GROUP BY date ORDER BY date DESC',
        (user_id, (today - timedelta(days=13)).strftime('%Y-%m-%d'))
    ).fetchall()

    pending = conn.execute(
        'SELECT * FROM goal_adjustments WHERE user_id = ? AND accepted = 0 AND dismissed = 0 ORDER BY suggested_at DESC LIMIT 1',
        (user_id,)
    ).fetchone()
    if pending:
        conn.close()
        return jsonify(dict(pending))

    if len(last_14) < 7:
        conn.close()
        return jsonify(None)

    avg = sum(row['total'] for row in last_14) / len(last_14)
    last_7 = last_14[:7]
    days_met = sum(1 for r in last_7 if r['total'] >= goal)
    days_missed = 7 - days_met

    suggestion = None
    if avg > goal * 1.2 and days_met >= 7:
        new_goal = min(60, round(avg / 5) * 5)
        if new_goal > goal:
            reason = f"You've been reading {round(avg)} min/day — want to raise your goal to {new_goal} min?"
            conn.execute(
                'INSERT INTO goal_adjustments (user_id, old_goal, new_goal, reason) VALUES (?, ?, ?, ?)',
                (user_id, goal, new_goal, reason)
            )
            conn.commit()
            suggestion = {'old_goal': goal, 'new_goal': new_goal, 'reason': reason, 'id': conn.execute('SELECT last_insert_rowid()').fetchone()[0]}
    elif days_missed >= 3:
        new_goal = max(10, goal - 5)
        if new_goal < goal:
            reason = f"You've missed {days_missed} of the last 7 days. Lower your goal to {new_goal} min to stay consistent?"
            conn.execute(
                'INSERT INTO goal_adjustments (user_id, old_goal, new_goal, reason) VALUES (?, ?, ?, ?)',
                (user_id, goal, new_goal, reason)
            )
            conn.commit()
            suggestion = {'old_goal': goal, 'new_goal': new_goal, 'reason': reason, 'id': conn.execute('SELECT last_insert_rowid()').fetchone()[0]}

    conn.close()
    return jsonify(suggestion)

@app.route('/api/user/<int:user_id>/accept_goal', methods=['POST'])
def accept_goal(user_id):
    data = request.json
    adj_id = data.get('adjustment_id')
    conn = get_db()
    adj = conn.execute('SELECT * FROM goal_adjustments WHERE id = ? AND user_id = ?', (adj_id, user_id)).fetchone()
    if not adj:
        conn.close()
        return jsonify({'error': 'Not found'}), 404
    conn.execute('UPDATE goal_adjustments SET accepted = 1 WHERE id = ?', (adj_id,))
    conn.execute('UPDATE users SET daily_goal_minutes = ? WHERE id = ?', (adj['new_goal'], user_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'new_goal': adj['new_goal']})

@app.route('/api/user/<int:user_id>/dismiss_goal', methods=['POST'])
def dismiss_goal(user_id):
    data = request.json
    adj_id = data.get('adjustment_id')
    conn = get_db()
    conn.execute('UPDATE goal_adjustments SET dismissed = 1 WHERE id = ?', (adj_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/user/<int:user_id>/update_settings', methods=['POST'])
def update_settings(user_id):
    data = request.json
    conn = get_db()
    if 'daily_goal_minutes' in data:
        conn.execute('UPDATE users SET daily_goal_minutes = ? WHERE id = ?', (data['daily_goal_minutes'], user_id))
    if 'preferred_reading_time' in data:
        conn.execute('UPDATE users SET preferred_reading_time = ? WHERE id = ?', (data['preferred_reading_time'], user_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/user/<int:user_id>/stats', methods=['GET'])
def get_stats(user_id):
    conn = get_db()
    today = datetime.now().date()

    weekly = []
    for i in range(7):
        d = (today - timedelta(days=6-i)).strftime('%Y-%m-%d')
        row = conn.execute('SELECT COALESCE(SUM(duration_minutes), 0) as total FROM reading_sessions WHERE user_id = ? AND date = ?', (user_id, d)).fetchone()
        weekly.append({'date': d, 'minutes': round(row['total'], 1)})

    monthly = []
    for i in range(4):
        end = today - timedelta(weeks=i)
        start = end - timedelta(days=6)
        row = conn.execute(
            'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM reading_sessions WHERE user_id = ? AND date >= ? AND date <= ?',
            (user_id, start.strftime('%Y-%m-%d'), end.strftime('%Y-%m-%d'))
        ).fetchone()
        monthly.append({
            'week': f"{start.strftime('%b %d')} - {end.strftime('%b %d')}",
            'minutes': round(row['total'], 1)
        })
    monthly.reverse()

    total_sessions = conn.execute('SELECT COUNT(*) as cnt FROM reading_sessions WHERE user_id = ? AND duration_minutes > 0', (user_id,)).fetchone()['cnt']
    total_minutes = conn.execute('SELECT COALESCE(SUM(duration_minutes), 0) as total FROM reading_sessions WHERE user_id = ? AND duration_minutes > 0', (user_id,)).fetchone()['total']
    avg_session = round(total_minutes / max(1, total_sessions), 1)
    longest_session = conn.execute('SELECT COALESCE(MAX(duration_minutes), 0) as mx FROM reading_sessions WHERE user_id = ?', (user_id,)).fetchone()['mx']

    best_week = conn.execute('''
        SELECT strftime('%Y-%W', date) as wk, SUM(duration_minutes) as total
        FROM reading_sessions WHERE user_id = ? AND duration_minutes > 0 GROUP BY wk ORDER BY total DESC LIMIT 1
    ''', (user_id,)).fetchone()

    streak_history = conn.execute('SELECT * FROM streak_history WHERE user_id = ? ORDER BY start_date DESC', (user_id,)).fetchall()
    user = dict(conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone())

    conn.close()
    return jsonify({
        'weekly': weekly,
        'monthly': monthly,
        'total_sessions': total_sessions,
        'total_hours': round(total_minutes / 60, 1),
        'avg_session': avg_session,
        'longest_session': round(longest_session, 1),
        'best_week_minutes': round(best_week['total'], 1) if best_week else 0,
        'longest_streak': user['longest_streak'],
        'streak_history': [dict(s) for s in streak_history]
    })

@app.route('/api/user/<int:user_id>/nudge', methods=['GET'])
def get_nudge(user_id):
    conn = get_db()
    user = dict(conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone())
    today = datetime.now()
    date_str = today.date().strftime('%Y-%m-%d')

    today_total = conn.execute(
        'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM reading_sessions WHERE user_id = ? AND date = ?',
        (user_id, date_str)
    ).fetchone()['total']

    conn.close()

    if today_total >= user['daily_goal_minutes']:
        return jsonify(None)

    remaining = round(user['daily_goal_minutes'] - today_total)
    hour = today.hour
    pref = user['preferred_reading_time']
    streak = user['current_streak']

    time_map = {'morning': (6, 10), 'afternoon': (12, 16), 'evening': (18, 22)}
    pref_start, pref_end = time_map.get(pref, (18, 22))

    nudge = None
    if hour >= 21:
        nudge = {
            'type': 'urgent',
            'message': f"Your {streak}-day streak is on the line — {remaining} minutes is all it takes.",
            'remaining': remaining
        }
    elif pref_start <= hour <= pref_end:
        nudge = {
            'type': 'gentle',
            'message': f"It's your favorite reading window. Just {remaining} minutes to keep your streak alive.",
            'remaining': remaining
        }

    return jsonify(nudge)

@app.route('/api/reset', methods=['POST'])
def reset_demo():
    seed_mock_data()
    return jsonify({'success': True})

@app.route('/')
@app.route('/<path:path>')
def serve_react(path=''):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    init_db()
    conn = get_db()
    user = conn.execute('SELECT COUNT(*) as cnt FROM users').fetchone()
    conn.close()
    if user['cnt'] == 0:
        seed_mock_data()
    port = int(os.environ.get('PORT', 8000))
    debug = port == 8000
    app.run(host='0.0.0.0', port=port, debug=debug)
