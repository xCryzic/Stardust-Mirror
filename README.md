# STARDUST — Mirror Protocol

## Run locally

```powershell
python -m pip install -r requirements.txt
python app.py
```

Open:

`http://127.0.0.1:8000`

For VS Code Live Share, share/forward port `8000`.

## Project structure

- `app.py` — single Flask backend, serves frontend pages and REST APIs
- `stardust.db` — SQLite database created/used by the app
- `index.html` — landing page with the startup animation
- `login.html` — authentication page posting to `/api/login`
- `leaderboard.html` — leaderboard page served by the app
- `style.css` — shared styling for pages
- `script.js` — site interaction scripts
- `startup-animation.css` / `startup-animation.js` — landing animation assets
- `logo.webp` — logo asset used by the landing page

## Questions

- `questions/question-page.html` — challenge index page
- `questions/question-1/` — question 1 page and assets
- `questions/question-2/` — question 2 page and assets
- `questions/question-3/` — question 3 assets exist, but current Flask routing only exposes Q1 and Q2

## Backend notes

The Flask app serves:

- `/` → `index.html`
- `/questions` → `questions/question-page.html`
- `/questions/question-1` → `questions/question-1/question-1.html`
- `/questions/question-2` → `questions/question-2/question-2.html`
- `/login` → `login.html`
- `/leaderboard` → `leaderboard.html`

API endpoints:

- `/api/login`
- `/api/logout`
- `/api/session`
- `/api/leaderboard`
- `/api/questions/<number>`
- `/api/questions/<question_id>/submit`
- `/api/health`

## Environment / flags

The app loads local `.env` files from:

- `questions/question-1/.env`
- `questions/question-2/.env`

These can configure `QUESTION_1_FLAG` and `QUESTION_2_FLAG` for challenge validation.

> Do not commit local `.env` files.

## Dependencies

- Flask>=3.0,<4.0
