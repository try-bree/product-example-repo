# Bree App

A React Native (Expo) cash advance application with an Express.js backend.

## Prerequisites

- Node.js >= 20
- npm

## Getting Started

### Backend

```bash
cd backend
npm install
npm start
```

Runs on http://localhost:3001. Uses SQLite — the database is created automatically on first run.

To reset the database to its initial state:

```bash
cd backend
npm run reset
```

### Frontend

```bash
cd breeapp
npm install
npm run web
```

Runs at http://localhost:8081.

### Login

Any email/password combination works (mock auth). The demo account is pre-filled:
- **Email**: demo@bree.co
- **Password**: anything

## Project Structure

```
backend/
  server.js          # Express API server
  database.js        # SQLite schema + seed data

breeapp/
  app/
    screens/         # App screens
    components/      # Reusable UI components
    context/         # React Context (AppContext, AuthContext)
    navigators/      # React Navigation setup
    services/api.ts  # API client
    theme/           # Colors, typography, spacing, shadows
```

## API

Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:id` | Get user details |
| GET | `/loans?userId=:id` | Get all loans for a user |
| GET | `/loans/:id` | Get specific loan details |
| POST | `/loans` | Create a new loan |
| POST | `/loans/:id/payback` | Pay back a loan |
| POST | `/loans/:id/cancel` | Cancel a pending loan |
| PUT | `/loans/:id/status` | Update loan status (admin) |
| POST | `/check-eligibility` | Check loan eligibility |
