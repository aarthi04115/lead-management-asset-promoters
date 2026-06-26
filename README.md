# Maestrominds CRM

Smart Real Estate CRM — full-stack project (React + Node/Express + MongoDB).

## Project Structure

```
maestrominds-crm/
├── backend/               # Express API server
│   ├── config/            # DB + Passport config
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routers
│   ├── services/          # Email + OTP utilities
│   └── server.js
├── frontend/              # React (Vite) app
│   ├── src/
│   │   ├── pages/         # Login, AdminDashboard, EmployeeDashboard, ChangePassword
│   │   ├── components/    # Navbar, ProtectedRoute
│   │   ├── context/       # AuthContext
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── index.css
│   └── index.html
├── .env.example
├── .gitignore
└── package.json           # Root scripts (runs both together)
```

## Quick Start

### 1. Install dependencies

```bash
npm run install:all
```

This installs packages in both `backend/` and `frontend/`.

### 2. Configure environment

```bash
cp .env.example backend/.env
```

Edit `backend/.env` and fill in at minimum:

- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string

### 3. Run in development

```bash
npm run dev
```

- Backend → http://localhost:5000
- Frontend → http://localhost:5173 (proxies `/api` → backend automatically)

### 4. Build for production

```bash
npm run build
```

Outputs static files to `frontend/dist/`. Serve them with any static host (Netlify, Vercel, etc.) and point your backend URL in `FRONTEND_URL`.

---

## Roles

| Role     | Login Portal    | Capabilities                              |
|----------|-----------------|-------------------------------------------|
| Admin    | Admin Portal    | Create/activate/deactivate/delete users, view all users |
| Employee | Employee Portal | View and edit own profile                |

Both roles can change their password via the navbar menu.

## API Endpoints

| Method | Path                       | Auth     | Description          |
|--------|----------------------------|----------|----------------------|
| POST   | /api/auth/login            | Public   | Login with role      |
| GET    | /api/auth/profile          | Any      | Get own profile      |
| PUT    | /api/auth/profile          | Any      | Update own name      |
| POST   | /api/auth/change-password  | Any      | Change password      |
| GET    | /api/auth/admin/users      | Admin    | List all users       |
| POST   | /api/auth/admin/users      | Admin    | Create user          |
| PUT    | /api/auth/admin/users/:id  | Admin    | Activate/deactivate  |
| DELETE | /api/auth/admin/users/:id  | Admin    | Delete user          |
| GET    | /api/health                | Public   | Server health check  |
