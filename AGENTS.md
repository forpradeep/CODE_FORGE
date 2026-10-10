# CodeForge — Agent Commands

## Backend (`backend/`)
```bash
cd backend

# Start in dev mode (auto-restart on file changes)
npm run dev

# Start in production mode
npm start

# Run the test suite
npm test

# Seed demo accounts (admin@test.com / faculty@test.com / student@test.com, all with Password@123)
node src/scripts/seedAccounts.js
```

## Frontend (`frontend/`)
```bash
cd frontend

# Start dev server
npm run dev

# Lint
npm run lint

# Production build
npm run build
```

## Docker
```bash
docker-compose up --build
```

## CI
GitHub Actions automatically runs on push/PR to `main`:
- Backend: installs deps, starts MongoDB + Redis services, runs `npm test`
- Frontend: installs deps, runs `npm run lint`, runs `npm run build`
