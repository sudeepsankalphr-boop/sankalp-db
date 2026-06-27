# Sankalp Database — Recruitment HRMS

## Setup

### Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* values
npm install
node seed.js        # creates admin@sankalp.com / Admin@123
npm run dev         # starts on :5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # starts on :5173 (proxies /api → :5000)
```

## Default login
- Email: `admin@sankalp.com`
- Password: `Admin@123`

## Features
- Client → Role → Candidate navigation
- Add/edit candidates with CV upload (PDF compression via pdf-lib)
- Excel export/import of candidates
- Bulk CV download as ZIP
- Admin panel: manage clients, roles, locations, users
- JWT auth (httpOnly cookie), admin/recruiter roles
