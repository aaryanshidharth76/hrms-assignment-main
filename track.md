# HRMS Project Track File

## Project: PeopleDesk (formerly HRMS Lite)

**Last Updated:** 2026-02-19 00:50 IST

---

## Setup Summary

### Backend
- **Tech:** FastAPI + Motor (async MongoDB)
- **Port:** 8000
- **Env file:** `backend/.env` (MONGODB_URI, CORS_ORIGINS)
- **Virtual env:** `backend/venv`
- **Start command:** `cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload`
- **DB fix:** `database.py` conditionally uses TLS only for cloud/Atlas URIs

### Frontend
- **Tech:** React 18 + Vite + Tailwind CSS + Framer Motion
- **Port:** 5173
- **Env file:** `frontend/.env` (VITE_API_BASE_URL=http://localhost:8000)
- **Start command:** `cd frontend; npm run dev`

### Database
- **MongoDB:** Running locally on port 27017
- **DB name:** hrms_lite

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

### Build Status: PASSING (vite build succeeds, dev server running on 5173)

---

## Pending
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
