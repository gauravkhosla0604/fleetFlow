# 🚛 FleetFlow — Full-Stack Fleet & Trip Management System

**FleetFlow** is an end-to-end fleet and logistics management platform built with **TypeScript** across the frontend and backend. It centralizes vehicle inventory, driver rosters, trip dispatching, fuel logs, and maintenance tracking into a single role-secured web application.

🌐 **Live Demo:** [https://fleet-flow-eosin.vercel.app](https://fleet-flow-eosin.vercel.app)

---

## ✨ Key Features

- **Role-Based Access Control (RBAC):** JWT authentication and custom Express authorization middleware separating `Admin` and `Dispatcher` permissions across protected frontend routes and REST endpoints.
- **Real-Time Operational Dashboard:** Live KPI summary cards aggregating active trips, fleet availability, fuel spend, and maintenance logs.
- **End-to-End Trip Dispatching:** Relational workflow linking vehicles, drivers, routes, and trip statuses in MongoDB.
- **Fleet, Driver, Fuel & Maintenance Modules:** Complete CRUD management for tracking asset availability, service history, and operational expenses.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js, TypeScript, JWT, Mongoose |
| **Database** | MongoDB |
| **Deployment** | Vercel (Frontend) & Render (Backend API) |

---

## 📁 Project Structure

```text
fleetflow/
├── client/                 # Next.js TypeScript frontend
│   ├── app/                # App Router pages (dashboard, login, register, trips, vehicles, drivers, fuel, maintenance)
│   ├── components/         # Reusable UI & dashboard components
│   ├── context/            # AuthContext for JWT session & route protection
│   └── lib/                # Axios API client configuration
└── server/                 # Express.js TypeScript REST API
    └── src/
        ├── config/         # MongoDB connection setup
        ├── controllers/    # Route business logic
        ├── middleware/     # JWT auth & role-based access middleware
        ├── models/         # Mongoose schemas (User, Trip, Driver, Vehicle, Fuel, Maintenance)
        └── routes/         # Express API route definitions
