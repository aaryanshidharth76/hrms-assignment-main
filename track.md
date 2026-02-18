# HRMS Lite - Project Tracking

## Last Updated: 2026-02-19

## Project Status: RUNNING

## Setup Completed
- [x] Explored project structure (FastAPI + MongoDB backend, React + Vite + Tailwind frontend)
- [x] Created `backend/.env` with local MongoDB URI (`mongodb://localhost:27017/hrms_lite`) and CORS origins
- [x] Created `frontend/.env` with `VITE_API_BASE_URL=http://localhost:8000`
- [x] Created Python virtual environment at `backend/venv`
- [x] Installed backend pip dependencies from `requirements.txt`
- [x] Installed frontend npm packages from `package.json`
- [x] Fixed `backend/app/database.py` - made TLS conditional (only for Atlas/cloud URIs, not local MongoDB)
- [x] Verified MongoDB service running on port 27017
- [x] Started backend server (uvicorn) on port 8000 - connected to MongoDB
- [x] Started frontend dev server (Vite) on port 5173

## Running Servers
| Service  | Port | Status  |
|----------|------|---------|
| Backend  | 8000 | Running |
| Frontend | 5173 | Running |
| MongoDB  | 27017| Running |

## Tech Stack
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic, Python 3.14.1
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Axios, Node.js v24.11.1
- **Database**: MongoDB (local)

## Key URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Files Modified
- `backend/app/database.py` - Made TLS conditional for local vs cloud MongoDB connections

## Notes
- No authentication (single admin user)
- Database name: `hrms_lite`
