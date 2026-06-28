# 🏢 Smart Real Estate CRM & Lead Management Platform

[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)](https://github.com/aarthi04115/Smart-Real-Estate-CRM-Dashboard)
[![Frontend](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

A comprehensive web-based Real Estate CRM designed to streamline lead management, automate assignments, and provide real-time analytics for sales performance.

---

## 🚀 Project Overview

The **Smart Real Estate CRM** is a high-performance platform that helps organizations manage the entire lead lifecycle—from ingestion and automated assignment to site visit verification and final closure. It features a centralized dashboard for both Admins and Employees, ensuring transparency and efficiency in sales operations.

### 🎯 Objective
- **Manage Leads**: Centralized storage and tracking of all customer inquiries.
- **Automated Assignment**: Efficiently distribute leads using Round Robin logic.
- **Track Performance**: Monitor employee productivity and sales metrics.
- **Verify Site Visits**: Use GPS and timestamping for field verification.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React.js, MUI | Responsive UI with Material Design components. |
| **State Management** | Context API / Redux | Efficient application-wide state handling. |
| **Backend** | Node.js, Express.js | Robust API layer for business logic. |
| **Authentication** | JWT | Secure Role-Based Access Control (RBAC). |
| **Database** | MongoDB Atlas | Scalable NoSQL database with Mongoose ODM. |
| **Deployment** | Vercel & Render | Continuous deployment for frontend and backend. |

---

## 👤 User Roles

### 🔑 Admin (Master Control)
- **Manage Employees**: Create, update, and monitor staff.
- **Property Management**: List and manage real estate inventory.
- **Lead Oversight**: Full control over lead distribution and status.
- **Advanced Analytics**: Access comprehensive reports and performance charts.

### 💼 Employee (Sales Agent)
- **Personal Dashboard**: View assigned leads and daily tasks.
- **Status Updates**: Move leads through the sales pipeline.
- **Follow-Up System**: Schedule and manage customer interaction reminders.
- **Site Visits**: Capture GPS location and selfies for visit verification.

---

## 🏗️ Core Modules

### 1️⃣ Authentication & User Management
Secure login system with Role-Based Access Control (RBAC).
- JWT-based session management.
- Protected API endpoints for Admin/Employee.

### 2️⃣ Lead Management
End-to-end lead lifecycle tracking.
- **Statuses**: New → Attempted → Connected → Interested → Site Visit → Negotiation → Booked/Sold/Lost.
- Comprehensive customer profiles with contact details and property interest.

### 3️⃣ Round Robin Assignment
Smart automation for equal lead distribution.
- Maintain employee queue for fair assignment.
- Detailed assignment history tracking.

### 4️⃣ Site Visit Verification
Ensuring accountability for field agents.
- **GPS Integration**: Captures Latitude/Longitude.
- **Timestamping**: Records exact visit time.
- **Selfie Proof**: Image upload for identity verification.

---

## 📂 Folder Structure

```text
backend/
  ├── controllers/  # API Logic
  ├── routes/       # Endpoint Definitions
  ├── models/       # MongoDB Schemas
  ├── middleware/   # Auth & Validation
  └── utils/        # Helpers (e.g., Token gen)

frontend/
  ├── components/   # Reusable UI Elements
  ├── pages/        # Dashboard & Management Views
  ├── services/     # API Integration
  └── context/      # State Management
```

---

## 🔗 Key API Endpoints

- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`
- **Leads**: `GET /api/leads`, `POST /api/leads`, `PUT /api/leads/:id`
- **Properties**: `GET /api/properties`, `POST /api/properties`
- **Site Visits**: `POST /api/site-visits`, `GET /api/site-visits`
- **Dashboard**: `GET /api/dashboard/admin`, `GET /api/dashboard/employee`

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **MongoDB Atlas** account (for cloud database)
- **Git** for version control

---

## 🔄 Final Workflow

1. **Setup**: Admin creates employees and property listings.
2. **Lead Entry**: New leads enter the system.
3. **Auto-Assign**: System assigns leads via Round Robin.
4. **Interaction**: Employee contacts lead and updates status.
5. **Field Work**: Employee schedules and performs site visits (GPS verified).
6. **Conversion**: Lead moves to negotiation and eventually to Booked or Sold.
7. **Analytics**: Dashboard metrics update in real-time.


