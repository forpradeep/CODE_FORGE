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

## Deployment Notes

- **Backend**: Can be deployed to Render, Railway, Heroku, or any VPS. Make sure to configure environment variables in your hosting dashboard.
- **Frontend**: Can be deployed to Vercel, Netlify, or Cloudflare Pages. Set `VITE_API_BASE_URL` to your production backend URL.
