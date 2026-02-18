# HRMS Project Track File

## Project: PeopleDesk (formerly HRMS Lite)

**Last Updated:** 2026-02-19 01:10 IST

---

## Live URLs
- **Frontend:** https://frontend-delta-brown-13.vercel.app
- **Backend API:** https://peopledesk-api.onrender.com
- **GitHub:** https://github.com/aaryanshidharth76/hrms-assignment-main (branch: frontend-redesign)

---

## Setup Summary

### Backend
- **Tech:** FastAPI + Motor (async MongoDB)
- **Port (local):** 8000
- **Env file:** `backend/.env` (MONGODB_URI, CORS_ORIGINS)
- **Virtual env:** `backend/venv`
- **Start command (local):** `cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload`
- **Render start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **DB fix:** `database.py` conditionally uses TLS only for cloud/Atlas URIs

### Frontend
- **Tech:** React 18 + Vite + Tailwind CSS + Framer Motion
- **Port (local):** 5173
- **Env file:** `frontend/.env` (VITE_API_BASE_URL=http://localhost:8000)
- **Vercel env:** VITE_API_BASE_URL=https://peopledesk-api.onrender.com
- **Start command:** `cd frontend; npm run dev`

### Database
- **MongoDB Atlas:** mongodb+srv://aaryanshidharth_db_user:admin123@cluster0.ylvp7td.mongodb.net

---

## Frontend Redesign (2026-02-19)

### Branch: `frontend-redesign`

### Changes Made:
1. **Branding:** "HRMS Lite" -> "PeopleDesk"
2. **Color Scheme:** Blue primary -> Teal/Cyan primary + Indigo accent
3. **Font:** Inter -> Outfit (Google Fonts)
4. **Background:** Dot pattern -> Mesh gradient (radial gradients)
5. **Cards:** Glassmorphism (backdrop-blur) -> Solid cards with soft shadows + left colored borders on stat cards
6. **Navigation:** Pill-based active state -> Underline-based active indicator
7. **Icons:** All emojis replaced with proper SVG icons throughout
8. **Toast:** Colored backgrounds -> Clean white/dark toasts with colored icon badges
9. **Loader:** Coffee emoji -> Clock SVG icon, "HRMS Lite" -> "PeopleDesk"

### Files Modified:
- `frontend/tailwind.config.js` - New colors, font, custom shadows
- `frontend/src/index.css` - Mesh gradient bg, new card/text-gradient utilities
- `frontend/index.html` - PeopleDesk title, Outfit font preload
- `frontend/src/App.jsx` - New navbar, logo, footer
- `frontend/src/pages/Dashboard.jsx` - Stat cards with left borders, SVG section icons
- `frontend/src/pages/Employees.jsx` - Updated colors throughout
- `frontend/src/pages/MarkAttendance.jsx` - Updated colors and stats bar
- `frontend/src/pages/Attendance.jsx` - Updated quick mark and history
- All 8 components (EmployeeForm, EmployeeTable, AttendanceForm, AttendanceTable, Toast, Loader, EmptyState, ErrorBanner)

---

## Deployment (2026-02-19)

### Backend -> Render
- Service name: `peopledesk-api`
- Root directory: `backend`
- Runtime: Python 3
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env vars: MONGODB_URI (Atlas), CORS_ORIGINS=*

### Frontend -> Vercel
- Deployed via Vercel CLI
- Framework: Vite
- Env var: VITE_API_BASE_URL=https://peopledesk-api.onrender.com

### Notes
- Render free tier has cold starts (~30 seconds on first request after inactivity)
- Git credentials switched from Kshitijkb28 to aaryanshidharth76 for push
