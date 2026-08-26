<div align="center">

# 🏙️ MyCity

**A civic issue reporting and city management platform**

Report it. Confirm it. Fix it.

![Status](https://img.shields.io/badge/status-active--development-brightgreen)
![Next.js](https://img.shields.io/badge/frontend-Next.js-black)
![Express](https://img.shields.io/badge/backend-Express-yellow)
![MySQL](https://img.shields.io/badge/database-MySQL-4479A1)
![License](https://img.shields.io/badge/license-private-lightgrey)

</div>

---

Citizens report local problems — broken streetlights, garbage collection issues, dangerous roads, water leaks — with a photo and a pin on the map. The community verifies what's real. City staff take it from there.

## ✨ Features

| | |
|---|---|
| 📍 **Citizen reporting** | Submit an issue with title, description, category, photo, and map-pin location |
| 🗺️ **Public dashboard** | Browse and filter every report by category on an interactive map |
| ✅ **Community verification** | Citizens confirm issues they've also seen — 5 confirmations auto-verifies a report |
| 🏷️ **Smart categorization** | Free keyword matching suggests the right category from the report text |
| 🛠️ **Admin queue** | Moderators move reports through Reported → Verified → In Progress → Fixed |
| 👷 **Work orders** | Verified reports get assigned to a technician with due dates and notes |
| 📋 **Technician dashboard** | Assigned staff see their queue and mark issues fixed |
| 📢 **Announcements** | Admins post notices for power cuts, road repairs, water cuts, cleaning campaigns, and health camps |
| 🔐 **Role-based auth** | JWT-secured citizen, technician, and admin roles |

## 🧱 Tech stack

<div align="center">

| Layer | Tech |
|---|---|
| Frontend | Next.js (TypeScript), React-Leaflet |
| Backend | Node.js, Express |
| Database | MySQL + Sequelize ORM |
| Auth | JWT + bcrypt |
| File storage | Cloudinary |

</div>

## 📁 Project structure

```
MyCity/
├── frontend/                  Next.js app
│   └── app/
│       ├── report/            Report submission form
│       ├── reports/           Public reports list + map
│       ├── announcements/     Public announcements
│       ├── login/, signup/    Citizen auth
│       └── admin/
│           ├── login/
│           ├── queue/         Moderation + work order assignment
│           └── announcements/ Post / delete announcements
│
└── backend/                   Express API
    ├── models/                User, Report, Confirmation, WorkOrder, Announcement
    ├── routes/                auth, reports, workorders, announcements
    ├── middleware/            requireAuth, requireAdmin, optionalAuth, requireAdminOrTechnician
    └── categorize.js          Keyword-based category suggestion
```

## 🚀 Getting started

### Prerequisites

- Node.js
- MySQL (e.g. via MySQL Workbench)
- A free [Cloudinary](https://cloudinary.com) account for photo storage

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DB_NAME=mycity
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

JWT_SECRET=some_long_random_secret_string
```

Create the database, then start the server (tables sync automatically):

```sql
CREATE DATABASE mycity;
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:3000** 🎉

### Seed an admin account

```bash
node seedAdmin.js
```

Default login: `admin@mycity.com` / `admin123` — change before any real deployment.

## 👥 Roles

| Role | Can do |
|---|---|
| 🧑‍🤝‍🧑 Citizen | Submit reports, confirm others' reports, view announcements |
| 👷 Technician | View and resolve assigned work orders |
| 🛡️ Admin | Moderate reports, assign work orders, post announcements |

## 🗺️ Roadmap

- [x] Citizen reporting with photo + map
- [x] Community confirmation / auto-verify
- [x] Admin moderation queue
- [x] Category auto-suggestion
- [x] Work orders + technician dashboard
- [x] Public announcements
- [ ] Analytics dashboard
- [ ] Asset / GIS inventory

---

<div align="center">
Built as a solo full-stack project 💪
</div>