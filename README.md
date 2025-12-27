# HARSHUU 2.0 – Backend Server

HARSHUU 2.0 is a **production-grade food delivery backend system**
built for a **real local-city business**, inspired by Zomato / Swiggy,
but optimized for WhatsApp-based ordering.

This is **NOT a demo project**.
This backend is designed to be used **daily by real customers**.

---

## 🚀 Tech Stack (Fixed & Mandatory)

### Backend
- Node.js (>=18)
- Express.js
- MongoDB Atlas
- Mongoose ODM
- JWT Authentication
- REST API Architecture

### Frontend (separate repo / folder)
- HTML + CSS + Vanilla JavaScript
- Admin Panel UI
- Customer UI
- API-driven (NO direct DB access)

---

## 🧠 System Architecture (High Level)
Frontend (Admin / Customer) | |  REST APIs (JSON) ↓ Node.js + Express Server | |  Mongoose ODM ↓ MongoDB Atlas (Single Database)
Copy code

✔ Single backend server  
✔ Single MongoDB database  
✔ Backend handles ALL business logic  
✔ Frontend is UI only  

---

## 📁 Project Structure
harshuu2-backend/ │ ├── src/ │   ├── app.js                  # Express app configuration │   ├── server.js               # Server entry point │ │   ├── config/ │   │   ├── db.js               # MongoDB connection │   │   ├── env.js              # Environment loader │   │   └── constants.js        # Platform fee, GST, delivery rules │ │   ├── models/ │   │   ├── restaurant.js │   │   ├── dish.js │   │   ├── order.js │   │   ├── invoice.js │   │   └── paymentSettings.js │ │   ├── routes/ │   │   ├── admin.routes.js │   │   ├── restaurant.routes.js │   │   ├── dish.routes.js │   │   ├── order.routes.js │   │   ├── setting.routes.js │   │   └── public.routes.js │ │   ├── controllers/ │   │   ├── admin.controller.js │   │   ├── restaurant.controller.js │   │   ├── dish.controller.js │   │   ├── order.controller.js │   │   └── settings.controller.js │ │   ├── services/ │   │   ├── billing.service.js  # GST, platform fee, totals │   │   ├── invoice.service.js  # Invoice generation │   │   └── whatsapp.service.js # WhatsApp order formatting │ │   ├── middlewares/ │   │   ├── auth.middleware.js │   │   ├── error.middleware.js │   │   └── validate.middleware.js │ │   └── utils/ │       ├── imageUpload.util.js │       └── logger.util.js │ ├── .env                        # Secrets (ignored in git) ├── .gitignore ├── package.json └── README.md
Copy code

---

## 🔐 Security Principles

- JWT-based admin protection
- Input validation on all APIs
- Centralized error handling
- No secrets committed to git
- MongoDB is the **ONLY** database
- No localStorage / fake storage

---

## 🧑‍💼 Admin Capabilities

Admin can:
- Add / remove restaurants
- Upload restaurant images
- Open / close restaurant
- Add / remove dishes
- Upload dish images
- Mark Veg / Non-Veg
- Edit dish prices
- Upload UPI QR image
- Configure platform charges

All changes **instantly reflect on customer UI**.

---

## 🛒 Customer Flow

1. **index.html**
   - Fetch restaurants from backend
   - Show OPEN / CLOSED status

2. **menu.html**
   - Fetch dishes by restaurant
   - Quantity selector
   - Cart handling

3. **order.html**
   - Cart summary
   - Server-side bill calculation
   - QR fetched from backend
   - WhatsApp order placement

---

## 🧾 Billing Logic (Server-Side Only)

Bill includes:
- Food total
- Platform fee
- Handling charge
- Delivery charge (per km)
- 5% GST (only on food)
- Grand Total

All billing is calculated on the server and returned as a structured invoice.

---

## 🌐 Core APIs
POST   /admin/login POST   /admin/restaurant PATCH  /admin/restaurant/:id/status POST   /admin/dish PATCH  /admin/dish/:id/price
GET    /restaurants GET    /menu/:restaurantId
POST   /order GET    /settings/qr
Copy code

---

## ⚙️ Environment Variables (.env)
PORT=5000 MONGO_URI=mongodb+srv://... JWT_SECRET=your_secret_key NODE_ENV=production
Copy code

---

## ▶️ Running the Server

### Development
```bash
npm install
npm run dev
Production
Copy code
Bash
npm start
