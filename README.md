# 🏦 Vault Goal — Savings Goal Tracker

> A full-stack personal finance web application to track savings goals, manage a virtual bank account, and visualize spending habits — built with React, Node.js, Express, and MongoDB.

🌐 **Live Demo:** [https://vault-frontend-cxnr.onrender.com](https://vault-frontend-cxnr.onrender.com)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Database Schema](#-database-schema)

---

## ✨ Features

### User Features
- **Authentication** — Email/password login and Google OAuth 2.0
- **Savings Goals** — Create, track, and manage personal savings milestones
- **Goal Analytics** — Interactive daily, weekly, and monthly savings charts
- **Vault Bank** — Link a virtual bank account with deposit and withdrawal support
- **Bank PIN Security** — 4-digit PIN gate to access banking features
- **Bank Statement** — Full transaction history with CSV export
- **Profile Management** — Update name, email, and password

### Admin Features
- **Admin Dashboard** — System-wide stats (users, balance, goals, transactions)
- **User Management** — Create, edit, and delete users
- **Bank Oversight** — View all accounts and adjust balances
- **Goal Management** — Edit or remove any user's savings goal
- **Transaction Audit** — Full log with transaction reversal support

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Axios, Lucide React |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT (JSON Web Tokens), Passport.js (Google OAuth 2.0) |
| **Deployment** | Render (Frontend: Static Site, Backend: Web Service) |
| **Version Control** | Git and GitHub |

---

## 📁 Project Structure

```
SavingsGoalTracker/
├── backend/
│   ├── controllers/
│   │   ├── adminController.js      # Admin CRUD operations
│   │   ├── authController.js       # Register & login
│   │   ├── bankController.js       # Bank account & transactions
│   │   ├── goalController.js       # Savings goals
│   │   └── userController.js       # Profile management
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   └── adminMiddleware.js      # Admin role guard
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── BankAccount.js          # Bank account schema
│   │   ├── Transaction.js          # Transaction schema
│   │   └── SavingsGoal.js          # Savings goal schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bankRoutes.js
│   │   ├── goalRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── utils/
│   │   └── logger.js
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── passport.js             # Google OAuth strategy
│   └── server.js                   # Express entry point
│
├── frontend/
│   ├── public/
│   │   └── _redirects              # Render SPA routing fix
│   └── src/
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Dashboard.js
│       │   ├── Profile.js
│       │   ├── BankDashboard.js
│       │   ├── BankPinGate.js
│       │   ├── BankStatement.js
│       │   └── NotFound.js
│       ├── admin/
│       │   ├── AdminLayout.js
│       │   ├── AdminDashboard.js
│       │   ├── AdminUsers.js
│       │   ├── AdminBank.js
│       │   ├── AdminGoals.js
│       │   └── AdminTransactions.js
│       └── services/
│           ├── api.js
│           └── bankService.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)

### 1. Clone the Repository
```bash
git clone https://github.com/Shajana-Mirsha/SavingsGoalTracker.git
cd SavingsGoalTracker
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:3000
```

Start the backend:
```bash
npm start
# Server runs on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
# App runs on http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend `.env`

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |
| `CLIENT_URL` | Frontend URL for redirects |

### Frontend `.env`

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |

---

## 📡 API Documentation

### Base URL
```
https://vault-goal.onrender.com/api
```

### Authentication Routes `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | Login with email and password |
| GET | `/google` | Initiate Google OAuth |
| GET | `/google/callback` | Google OAuth callback |

### User Routes `/api/user`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | Get current user profile |
| PUT | `/profile` | Update name and email |
| PUT | `/change-password` | Change password |
| DELETE | `/delete-account` | Delete account and all data |

### Bank Routes `/api/bank`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/setup` | Link bank account |
| GET | `/account` | Get account details |
| GET | `/transactions` | Get transaction history |
| POST | `/credit` | Deposit funds |
| POST | `/debit` | Withdraw funds |
| POST | `/set-pin` | Set 4-digit bank PIN |
| POST | `/verify-pin` | Verify PIN and get bank session token |

### Goals Routes `/api/goals`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create savings goal |
| GET | `/` | Get all user goals |
| PUT | `/:id` | Add contribution to goal |
| PUT | `/:id/extend` | Extend goal deadline |
| DELETE | `/:id` | Delete goal |

### Admin Routes `/api/admin`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | System-wide statistics |
| GET | `/users` | List all users |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Hard delete user and all data |
| GET | `/accounts` | List all bank accounts |
| PUT | `/accounts/:id` | Adjust account balance |
| GET | `/goals` | List all goals |
| PUT | `/goals/:id` | Edit goal |
| DELETE | `/goals/:id` | Soft delete goal |
| GET | `/transactions` | List all transactions |
| POST | `/transactions/:id/reverse` | Reverse a transaction |

---

## 🚢 Deployment

This project is deployed on **Render** using two separate services:

### Frontend — Static Site
- **URL:** https://vault-frontend-cxnr.onrender.com
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `build`
- **Rewrite Rule:** `/* → /index.html` (for React Router)
- **Environment Variable:** `REACT_APP_API_URL=https://vault-goal.onrender.com/api`

### Backend — Web Service
- **URL:** https://vault-goal.onrender.com
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment Variables:** `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CLIENT_URL`, `GOOGLE_CALLBACK_URL`

### CI/CD Pipeline
Every `git push` to the `main` branch automatically triggers a redeploy on Render for both services.

---

## 🗄️ Database Schema

### User
```json
{
  "email": "String (required, unique)",
  "password": "String (hashed, nullable for Google users)",
  "name": "String",
  "role": "USER | ADMIN",
  "googleId": "String (nullable)",
  "isDeleted": "Boolean"
}
```

### BankAccount
```json
{
  "userId": "ObjectId → User",
  "accountNumber": "String (unique)",
  "bankName": "Vault Bank (immutable)",
  "balance": "Number (min: 0)",
  "pin": "String (hashed, nullable)"
}
```

### SavingsGoal
```json
{
  "userId": "ObjectId → User",
  "goalName": "String",
  "targetAmount": "Number",
  "savedAmount": "Number",
  "deadline": "Date",
  "history": [{ "amount": "Number", "date": "Date" }],
  "isDeleted": "Boolean"
}
```

### Transaction
```json
{
  "transactionId": "String (unique, TXN + timestamp)",
  "userId": "ObjectId → User",
  "accountId": "ObjectId → BankAccount",
  "type": "CREDIT | DEBIT",
  "amount": "Number",
  "purpose": "String",
  "relatedGoalId": "ObjectId → SavingsGoal (nullable)",
  "balanceAfter": "Number"
}
```
