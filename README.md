# 🌍 Community Hero

An AI-powered civic issue reporting platform that enables citizens to report community problems, automatically classifies them using AI, and helps administrators manage and resolve issues efficiently.

---

## 🚀 Features

### 👥 Citizen Features
- Report community issues
- Upload image evidence
- Search location using OpenStreetMap
- Use current GPS location
- AI-powered issue classification
- Interactive community issues map
- AI Assistant for civic-related queries

### 🛠️ Admin Features
- Secure Admin Login
- Dashboard with issue statistics
- View all reported issues
- Update issue status
- Delete invalid/spam reports
- Role-based access for administrative actions

### 🤖 AI Features
- Automatic Category Prediction
- Severity Detection
- Department Assignment
- AI Chat Assistant powered by Google Gemini

---

# 🏗️ Tech Stack

## Frontend
- React
- React Router DOM
- Tailwind CSS
- Framer Motion
- Axios
- Leaflet (OpenStreetMap)

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- Google Gemini AI

---

# 📂 Project Structure
---
community-hero/
│
├── src/                # React frontend
├── dist/               # Production build
├── server.ts           # Express server
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/community-hero.git

cd community-hero
```

---

## Backend Setup

```bash
cd server

npm install
```

Create a `.env` file

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_gemini_api_key

ADMIN_SECRET=your_admin_secret
```

Start backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd client

npm install
```

Create a `.env` file

```env
VITE_API_URL=http://localhost:8000/api
```

Run frontend

```bash
npm run dev
```

---

# 📌 Environment Variables

Backend

| Variable | Description |
|-----------|-------------|
| PORT | Server Port |
| MONGODB_URI | MongoDB Atlas Connection String |
| GEMINI_API_KEY | Google Gemini API Key |
| ADMIN_SECRET | Admin Authentication Secret |

Frontend

| Variable | Description |
|-----------|-------------|
| VITE_API_URL | Backend API URL |

---

# 🌐 API Endpoints

## Issues

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/issues | Get all issues |
| POST | /api/issues | Create new issue |
| PUT | /api/issues/:id | Update issue status |
| DELETE | /api/issues/:id | Delete issue |
| GET | /api/issues/:id/image | Get issue image |

---

## AI

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/ai/analyze | Analyze issue using AI |
| POST | /api/ai/chat | AI Assistant |

---

## Admin

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/admin/login | Admin Login |

---

# 🗺️ Workflow

```
Citizen

     │
     ▼

Report Issue
     │
     ▼

AI Analysis
(Category + Severity + Department)
     │
     ▼

Store in MongoDB
     │
     ▼

Display on Community Map
     │
     ▼

Admin Dashboard
     │
     ├── Update Status
     ├── Delete Report
     └── Resolve Issue
```

---

# 🔒 Security

- Admin-only Dashboard Actions
- Backend Authorization for Update/Delete
- Environment Variables for Sensitive Keys
- Secure Image Upload Handling

---

# 📸 Screenshots

Add screenshots of:

- Home Page
- Report Issue
- Community Map
- AI Assistant
- Admin Login
- Dashboard

---

# 🔮 Future Improvements

- Email Notifications
- User Authentication
- Issue Tracking for Citizens
- Analytics Dashboard
- Mobile Application
- Multi-language Support
- Push Notifications
- Government Department Portal

---

# 👨‍💻 Author

**Krishna Nandan Jha**

B.Tech Computer Science Engineering

Jaypee University of Information Technology

---

# 📄 License

This project is developed for educational purposes.