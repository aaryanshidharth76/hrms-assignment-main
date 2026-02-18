# HRMS Lite

A lightweight, professional Human Resource Management System for employee management and attendance tracking. Built with a modern tech stack featuring React, FastAPI, and MongoDB.

![HRMS Lite](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)

## ✨ Features

### Employee Management
- Add new employees with ID, name, email, and department
- View all employees in an animated, searchable table
- Filter employees by department
- Delete employees with confirmation modal
- Email and employee ID uniqueness validation

### Attendance Tracking
- **Bulk Attendance Page** - Mark attendance for all employees at once
- **Individual Attendance** - Quick mark buttons for single employee
- One attendance record per employee per day
- Attendance history with sortable records
- Date picker for marking past attendance

### Dashboard
- Real-time statistics (total employees, present, absent, not marked)
- Department distribution overview
- Recent activity feed
- Recently added employees section
- Quick navigation to all features

### UI/UX
- 🌓 **Dark/Light Theme Toggle** - Persistent theme preference
- Smooth page transitions with Framer Motion
- Animated table rows and hover effects
- Glassmorphism design with backdrop blur
- Loading skeletons and spinners
- Toast notifications for feedback
- Fully responsive design
- Premium, modern aesthetics

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **MongoDB Atlas** - Cloud database

### Frontend
- **React 18** - UI library (Vite)
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Axios** - HTTP client

## 📁 Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry
│   │   ├── database.py       # MongoDB connection
│   │   ├── models/           # Document helpers
│   │   ├── schemas/          # Pydantic models
│   │   ├── routes/           # API endpoints
│   │   └── utils/            # Validators
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios service
│   │   ├── components/       # Reusable UI
│   │   ├── context/          # Theme context
│   │   ├── pages/            # Route pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Attendance.jsx
│   │   │   └── MarkAttendance.jsx
│   │   ├── App.jsx           # Main app + navigation
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if backend is on different URL

# Run dev server
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📡 API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/employees` | Create employee |
| GET | `/employees` | List all employees |
| GET | `/employees/{id}` | Get single employee (by ID or employee_id) |
| DELETE | `/employees/{id}` | Delete employee + attendance records |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/attendance` | Mark attendance |
| GET | `/attendance/{employee_id}` | Get attendance history |
| GET | `/attendance/today/summary` | Today's stats (counts only existing employees) |

## 🖥 Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Redirect | Redirects to Dashboard |
| `/dashboard` | Dashboard | Stats, departments, activity |
| `/employees` | Employees | Employee list with search & filter |
| `/mark-attendance` | Bulk Attendance | Mark attendance for all employees |
| `/attendance/:id` | Individual Attendance | Single employee attendance history |

## 🚢 Deployment

### Backend (Render)
1. Create new Web Service on Render
2. Connect to GitHub repository
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables: `MONGODB_URI` and `CORS_ORIGINS`

### Frontend (Vercel)
1. Import project to Vercel
2. Set **Root Directory**: `frontend`
3. Add environment variable: `VITE_API_BASE_URL` pointing to Render backend
4. Deploy

## ⚙️ Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hrms_lite
CORS_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

## 📝 Assumptions & Limitations

- Single admin user (no authentication)
- Attendance can only be marked for current/past dates
- One attendance record per employee per day
- Employees can be deleted (cascade deletes attendance records)
- Email and Employee ID must be unique

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for any purpose.

---

Built with ❤️ using React, FastAPI & MongoDB
