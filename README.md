# Bree Cash Advance — Technical Interview

## Session Outline

| Segment | Duration | What Happens |
| --- | --- | --- |
| Setup & Orientation | 5 min | Get the app running, explore the codebase |
| Product & Design Discussion | 20 min | Discuss the problem, propose your approach |
| Implementation | 25 min | Build your solution (frontend + backend) |
| Curveball & Wrap-up | 10 min | Respond to new information, discuss trade-offs |

---

## The Problem

Bree is a cash advance app. Users borrow $50–$500 and repay within 7–14 days.

**15% of loans end up defaulting.** We surveyed users who defaulted, and the #1 response was:

> *"I had the money eventually, just not all at once on the due date."*

Currently, repayment is all-or-nothing — users must pay the full amount (advance + tip + delivery fee) in a single payment. There's no option to pay part now and the rest later.

## Your Goal

Design and build a flexible repayment system that lets users make partial payments toward their loan balance.

You have the existing codebase (frontend + backend) and ~25 minutes of implementation time. You don't need to build the complete system — we want to see how you think about the problem end-to-end.

## What We're Evaluating

- **Product Sense** — How you think about the user problem and prioritize what to build
- **System Design** — How you reason about data models, API contracts, and where logic lives
- **Code Ownership** — Clean, readable implementation that fits with existing patterns
- **Adaptability** — How you respond to new information mid-session

---

## Setup

### Backend

```
cd backend
npm install    # first time only
npm start      # runs on http://localhost:3001
```

Uses SQLite (auto-created on startup). To reset the database, delete `backend/interview.db` and restart the server.

### Frontend

```
cd breeapp
npm install    # first time only
npm run web    # runs at http://localhost:8081
```

---

## App Orientation

1. **Login** — Any email/password works (mock auth). Credentials are pre-filled.
2. **Home tab** — Shows "Repay Active Loan" (if active loan exists) or "Get Cash Now"
3. **Cash Advance flow** — Amount selection → tip selection → review → submit
4. **Repayment screen** — Shows active loan with repay/cancel actions
5. **Settings tab** — User settings and logout
6. **Admin tab** — Approve/reject pending loans (useful for testing)

### Demo User

- **Email**: `demo@bree.co` (ID: 1, Credit Score: 720)
- Has 5 historical loans and 1 active approved loan ($393.49 total)

---

## API Reference

Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/users/:id` | Get user details |
| GET | `/loans?userId=:id` | Get all loans for a user |
| GET | `/loans/:id` | Get specific loan details |
| POST | `/loans` | Create a new loan |
| POST | `/loans/:id/payback` | Pay back a loan **(currently requires full amount)** |
| POST | `/loans/:id/cancel` | Cancel a pending loan |
| PUT | `/loans/:id/status` | Update loan status (admin) |
| POST | `/check-eligibility` | Check loan eligibility |

### Payback Endpoint (current behavior)

`POST /api/loans/:id/payback` — Request body: `{ "amount": number }`

The endpoint currently **rejects any payment less than the full amount owed**:

```
Total owed = amount + tip + delivery_fee
If payment < total owed → 400: "Payment amount $X is insufficient. Total owed: $Y"
```

---

## Data Model

**users** — `id`, `email`, `name`, `credit_score`, `has_active_loan`, `created_at`

**loans** — `id`, `user_id`, `amount`, `tip`, `due_date`, `risk_level`, `status`, `delivery_method`, `delivery_fee`, `created_at`

- Statuses: `pending`, `approved`, `rejected`, `paid`, `canceled`, `defaulted`

**payments** — `id`, `loan_id`, `amount`, `payment_date`, `payment_method`, `status`

- Statuses: `completed`, `failed`

---

## Available Components & Theme

### Components (`@/components`)

`Screen`, `Card`, `Button`, `Text`, `TextField`, `ListItem`, `EmptyState`, `Icon`, `Header`, `ActiveLoanCard`, `TipSelector`, `Toggle`, `Switch`, `Checkbox`, `Radio`

### Theme (`@/theme`)

- **Colors** — `colors.palette.primary600` (green), semantic colors (success, warning, error), financial colors (money, profit, loss, pending)
- **Spacing** — 8px grid: `spacing.xs` (4) through `spacing.massive` (64)
- **Typography** — `typography.headingSmall`, `typography.bodyMedium`, `typography.currency`, etc.
- **Shadows** — `shadows.sm` through `shadows.xxl`

### API Client (`@/services/api`)

```
api.getUser(id)
api.getLoanHistory(userId)
api.getLoanDetails(loanId)
api.payBackLoan(loanId, amount)
api.cancelLoan(loanId)
api.getActiveLoan(userId)
api.checkEligibility(userId, amount)
api.updateLoanStatus(loanId, status)
```

### Context (`@/context/AppContext`)

```
const { user, currentLoan, loanHistory, loading, error } = useApp()
```

---

## Tips

- **Modify the backend freely** — change endpoints, add new ones, update the schema
- **The Admin tab** is useful for approving test loans during development
- **To reset everything**, delete `backend/interview.db` and restart the backend
- **AI tools are welcome** — use whatever you'd normally use in your workflow
