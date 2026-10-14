# BookBridge — Used Books Marketplace
### Full-Stack MERN Application (MongoDB · Express · React · Node)

A student marketplace to buy and sell old and used books at honest prices.

---

## 🌟 Tech Stack (MERN Architecture)
- **Frontend**: **React.js** (Vite, Tailwind CSS 4, React Router)
- **Backend**: **Node.js** & **Express.js** REST API with JWT Auth
- **Database**: **MongoDB** with **Mongoose** (local MongoDB / MongoDB Atlas, with an embedded in-memory fallback so the app still starts with zero manual setup)
- **Connection**: Axios with an authorization interceptor & CORS

---

## 📁 Project Structure
```
bookbridge/
├── package.json          # root scripts: npm start / seed / install:all
├── start.js              # starts backend + frontend together
├── backend/
│   ├── .env              # PORT, MONGODB_URI, JWT_SECRET
│   ├── package.json
│   └── src/
│       ├── server.js     # Express app entry
│       ├── seed.js       # demo data
│       ├── constants.js  # categories, conditions, order statuses
│       ├── config/db.js  # MongoDB connection (+ embedded fallback)
│       ├── models/       # User, Book, Order (Mongoose)
│       ├── middleware/   # JWT auth
│       ├── routes/       # auth, books, orders
│       └── utils/        # serializers & helpers
└── frontend/
    ├── package.json
    ├── vite.config.js    # dev server :5173, proxies /api -> :5000
    ├── index.html
    └── src/
        ├── main.jsx · App.jsx · index.css
        ├── pages/        # Home, Browse, BookDetail, Cart, Sell, Dashboard, Order, Login, Register
        ├── components/   # Navbar, Footer, BookCard, FilterBar, ...
        ├── context/      # AuthContext (JWT), CartContext (localStorage)
        └── lib/          # axios client, catalog constants, helpers
```

---

## 🚀 Key Features
- **Accounts**: register / login with email + password (JWT, 7-day sessions).
- **Sell**: list a book with price, MRP, condition, category, edition, ISBN and **3 required photos**.
- **Browse**: search by title/author, filter by category, condition and max price, sort by newest / price.
- **Cart & Checkout**: add books, place an order with meetup address and phone. Each book is claimed with an atomic `isSold: false → true` update, so two buyers can never buy the same book (works on a standalone MongoDB, no replica set needed).
- **Dashboard**: my listings (mark sold / delete), my purchases, and my sales.
- **Order tracking**: Order placed → Packed → Shipped → Out for delivery → Delivered (buyer or seller can update).

---

## 🔑 Demo Credentials
| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| Student | Pranav Jagdale | `student@gmail.com` | `password123` |

The demo account is created automatically on first start (or by `npm run seed`).

---

## 🏃 Running the Application

**Prerequisite:** Node.js 20+. MongoDB is optional — if nothing is running at `MONGODB_URI`, an embedded in-memory MongoDB is started automatically (data resets on restart). For persistent data install **MongoDB Community Server** (and optionally **MongoDB Compass**) and keep `mongod` running on port 27017, or point `MONGODB_URI` in `backend/.env` to MongoDB Atlas.

### 1. Install dependencies (once)
```bash
npm run install:all
```
or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2a. Run both together (recommended)
From the project root:
```bash
npm start
```
- **Backend API**: `http://localhost:5000`
- **Frontend Web App**: `http://localhost:5173`

### 2b. Run separately
```bash
cd backend  && npm start        # API
cd frontend && npm run dev      # web app
```

### Seed the database (optional)
```bash
npm run seed       # wipes users/books/orders and recreates the demo account
```

### Configuration (`backend/.env`)
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bookbridge
JWT_SECRET=change-me-to-a-long-random-string
NODE_ENV=development
```
Set a long random `JWT_SECRET` before deploying anywhere public. With `NODE_ENV=production` the embedded fallback is disabled.

---

## 🗄️ Data Model
| Collection | Fields |
|---|---|
| users  | name, email (unique), passwordHash, city, createdAt |
| books  | sellerId → users, title, author, category, condition, price, mrp, description, city, edition, isbn, imageUrls[3], isSold, createdAt |
| orders | buyerId → users, total, status, buyerName, shippingAddress, contactPhone, items[{bookId, title, author, price}], createdAt |

IDs are MongoDB ObjectIds. Orders show a short 6-character number in the UI. Book photos are stored as base64 data URLs (resized to ≤800px in the browser).

---

## 📡 API Endpoints
Authenticated routes expect `Authorization: Bearer <token>` (added automatically by the frontend's axios client).

- `POST /api/auth/register` · `POST /api/auth/login` — returns `{ user, token }`
- `GET  /api/auth/me` — current user
- `GET  /api/books` — list & filter (`q, category, condition, maxPrice, sellerId, includeSold, sort, limit, excludeId`)
- `GET  /api/books/stats` — total listings counter
- `GET  /api/books/:id` — book details with seller
- `POST /api/books` — create listing (auth)
- `PATCH /api/books/:id` — update price / description / sold flag (seller only)
- `DELETE /api/books/:id` — delete unsold listing (seller only)
- `GET  /api/orders` — my orders (`?role=seller` for sales)
- `GET  /api/orders/:id` — order details (buyer only)
- `POST /api/orders` — place an order (auth)
- `PATCH /api/orders/:id` — update delivery status (buyer or seller)
- `GET  /api/health` — MongoDB connectivity check
