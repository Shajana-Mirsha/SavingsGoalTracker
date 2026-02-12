# Savings Goal Tracker

## Description

The Savings Goal Tracker is a full-stack application that helps users create, manage, and monitor their personal savings goals.
Users can set a target amount, update their savings, and track progress until the goal is completed.

---

## Technology Used

* Frontend: React.js, HTML, CSS, JavaScript
* Backend: Node.js, Express.js
* Database: MongoDB
* Tools: GitHub, MongoDB Compass, dotenv

---

## Project Structure

```
savings-goal-tracker/
│
├── backend/        # Frontend (React)
├── frontend/        # Backend (Node + Express)
├── .env           # Environment configuration
└── README.md
```

---

## Features

* User login and authentication
* Create savings goals
* Update saved amount
* Track progress
* View completion status
* Secure data storage

---

## Setup Instructions

### Install Dependencies

```
cd server
npm install

cd ../client
npm install
```

### Configure Environment Variables (.env)

```
PORT=5000
MONGO_URI=your_mongodb_uri
```

### Run Application

Backend:

```
npm start
```

Frontend:

```
npm start
```

---

## Database Collections

* **users** → Stores user information
* **savingsgoals** → Stores savings goal data linked using userId

Relationship:

```
One User → Many Savings Goals (1:N)
```

---

## Purpose

This project is developed to demonstrate full-stack development, database design, and goal-based financial tracking.
