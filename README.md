# CodeJudge / LeetCode Platform

A full-stack competitive programming and assessment platform built with React, Node.js/Express, MongoDB, Redis, Judge0, and Google Gemini AI.

## Project Structure

```
├── backend/                # Express.js REST API & Services
│   ├── src/
│   │   ├── config/         # Database & Redis configuration
│   │   ├── controllers/    # Route controllers (problems, auth, submissions, tests, sections)
│   │   ├── middleware/     # Auth, admin, faculty, error handling, rate limiting
│   │   ├── models/         # Mongoose models (User, Problem, Submission, Test, Section, Attempt)
│   │   ├── routes/         # Express routers
│   │   └── utils/          # Problem utilities & validation
│   ├── .env.example        # Environment variables template
│   └── package.json
│
├── frontend/               # React + Vite Client Application
│   ├── src/
│   │   ├── components/     # UI & Admin components (Code editor, submissions, AI chat)
│   │   ├── pages/          # Pages (Problems, Tests, Faculty, Admin, Auth, Profile)
│   │   ├── store/          # Redux Toolkit store & slices
│   │   └── utils/          # Axios HTTP client
│   ├── .env.example        # Environment variables template
│   └── package.json
└── README.md
```

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your database URI and API keys in .env
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Configure VITE_API_BASE_URL if different from http://localhost:3000
npm run dev
```

### 3. Docker

From `clean-app`:

```bash
docker compose up --build
```

The site is at `http://localhost`. The API is also on `http://127.0.0.1:3000` for local debugging. MongoDB and Redis are bound to localhost only.

For a real deployment set `NODE_ENV=production`, a unique `JWT_KEY` of at least 32 characters, `COOKIE_SECURE=true`, and HTTPS in front of the frontend. Put Judge0, Gemini, and Cloudinary keys in a `.env` file next to `docker-compose.yml` so Compose can pass them through.

Demo accounts (local only):

```bash
cd backend
npm run seed
```

`admin@test.com`, `faculty@test.com`, and `student@test.com` share `Password@123` unless `SEED_PASSWORD` is set. Seeding is refused when `NODE_ENV=production` unless `ALLOW_SEED=true`.

## Deployment Notes

- **Same host**: build the frontend with no `VITE_API_BASE_URL`. The app calls `/api`, and nginx proxies that to the backend. Sessions use an httpOnly cookie.
- **Split hosts** (Vercel + Render): set `VITE_API_BASE_URL` to the backend origin, set `CLIENT_URL` to the frontend origin, and set `COOKIE_SAMESITE=none` with `COOKIE_SECURE=true`.
- **Health**: `GET /health` is process liveness. `GET /ready` checks MongoDB and Redis.
- **Required production env**: `DB_CONNECT_STRING`, `JWT_KEY`, `CLIENT_URL`. Judge0, Gemini, and Cloudinary are required only for run/submit, AI chat, and video upload.
