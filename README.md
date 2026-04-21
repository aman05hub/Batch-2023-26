# 📸 BCA Batch 2023–26 Photo Album
### Shree P M Patel College of Computer Science & Technology

A full-stack MERN web application for the BCA Batch 2023–26 photo gallery. Visitors scan a QR code and can view beautiful photo albums. Admins can create albums, upload photos, and generate QR codes per album.

---

## 🚀 Features

- **Public Gallery** — Anyone with the URL/QR code can view albums and photos
- **Masonry Photo Grid** — Beautiful responsive photo layout
- **Lightbox Viewer** — Click any photo to view full size with prev/next navigation + download
- **QR Code Generation** — Generate & download a QR code for every album (per-album URL)
- **Admin Dashboard** — Secure JWT-protected admin panel
- **ImageKit Integration** — Photos stored on ImageKit CDN (fast delivery, no storage limits on your server)
- **Drag & Drop Upload** — Upload up to 50 photos at once with progress bar
- **Album Management** — Create, edit, delete albums; set cover photos
- **Dark Luxury UI** — Gold-accented dark theme with Cormorant Garamond typography

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Axios, qrcode.react |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Image Storage | ImageKit.io |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Styling | Plain CSS with CSS Variables |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- ImageKit account (free tier works great)

---

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. ImageKit Setup

1. Go to [imagekit.io](https://imagekit.io) and create a free account
2. From your dashboard, get:
   - **Public Key**
   - **Private Key**
   - **URL Endpoint** (looks like `https://ik.imagekit.io/your_id`)

---

### 3. Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bca_album
JWT_SECRET=change_this_to_a_random_long_string

IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

ADMIN_EMAIL=admin@spmpatel.edu.in
ADMIN_PASSWORD=YourSecurePassword123
```

---

### 4. Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SITE_URL=http://localhost:3000
```

> For production, set `REACT_APP_SITE_URL` to your actual domain (used for QR code URLs).

---

### 5. Run the App

**Backend:**
```bash
cd backend
npm run dev    # development (nodemon)
# OR
npm start      # production
```

**Frontend:**
```bash
cd frontend
npm start
```

App runs at `http://localhost:3000`  
API runs at `http://localhost:5000`

---

## 👤 Admin Usage

1. Visit `http://localhost:3000/admin/login`
2. Enter the credentials from your `.env` file
3. On first login, the admin account is auto-created

### Creating Albums
1. Click **New Album** in the dashboard
2. Enter title, description, date, and tags
3. Click **Create Album**

### Uploading Photos
1. Click **Photos** next to any album
2. Drag & drop images or click to browse
3. Upload up to 50 photos at a time
4. Click any photo's **Cover** button to set as album cover

### QR Codes
1. Click **QR** next to any album
2. A QR code for that album's URL is shown
3. Click **Download QR** to save as PNG
4. Print and paste anywhere — students scan and view the album!

---

## 🌐 Production Deployment

### Backend (e.g., Render / Railway)
- Set all environment variables in the platform's settings
- Set `FRONTEND_URL` to your React app's URL (for CORS)

### Frontend (e.g., Vercel / Netlify)
- Set `REACT_APP_API_URL` to your backend URL
- Set `REACT_APP_SITE_URL` to your frontend domain

---

## 📁 Project Structure

```
bca-album/
├── backend/
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Album.js
│   │   └── Photo.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── albums.js
│   │   ├── photos.js
│   │   └── imagekit.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Home.js          ← Public album listing
    │   │   ├── AlbumView.js     ← Public photo viewer
    │   │   ├── Login.js         ← Admin login
    │   │   ├── AdminDashboard.js ← Album management + QR
    │   │   └── AdminAlbum.js    ← Photo upload management
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## 🔒 Security Notes

- JWT tokens expire in 7 days
- Passwords are hashed with bcrypt (salt rounds: 12)
- Admin-only routes are protected by middleware
- CORS is restricted to the frontend URL

---

Made with ❤️ for **Shree P M Patel College of Computer Science & Technology**  
BCA Department · Batch 2023–2026
