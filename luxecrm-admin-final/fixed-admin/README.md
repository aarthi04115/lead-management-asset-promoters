# LuxeCRM — Admin Dashboard

Two folders inside: `frontend` (React/Vite) + `backend` (Node/Express/MongoDB).

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
# Requires MongoDB running locally
```

### 2. Frontend
```bash
cd .. (or open a new terminal at luxecrm-admin root)
npm install
npm run dev
# Runs on http://localhost:5173
```

## Features
- ✅ Create / Edit / Delete properties (full CRUD)
- ✅ Upload multiple gallery images (stored as base64)
- ✅ Upload brochure PDF — stored in DB, **downloads for real**
- ✅ Gallery tab shows all uploaded images with thumbnail picker
- ✅ Live stats (Total / Available / Booked / Negotiation) from backend
- ✅ Search + Location filter
- ✅ Grid / List view toggle
- ✅ Confirm dialog before delete
