# 🌾 Ethio Farmers - Agricultural Marketplace

A comprehensive e-commerce platform connecting Ethiopian farmers directly with buyers, eliminating intermediaries and ensuring fair prices for both parties.

## 🚀 Features

### **For Farmers:**
- ✅ Create and manage product listings
- ✅ Track orders and manage inventory
- ✅ Set competitive pricing
- ✅ Receive direct payments
- ✅ Analytics dashboard

### **For Buyers:**
- ✅ Browse fresh produce from local farmers
- ✅ Advanced search and filtering
- ✅ Shopping cart functionality
- ✅ Secure checkout process
- ✅ Order tracking
- ✅ Product reviews and ratings

### **Platform Features:**
- ✅ User authentication (Firebase)
- ✅ Role-based access control
- ✅ Real-time inventory management
- ✅ Responsive design
- ✅ Multi-language support (English/Amharic ready)

## 🛠️ Tech Stack

### **Frontend:**
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Firebase Authentication**
- **Lucide React** for icons

### **Backend:**
- **Node.js** with Express
- **MySQL** database
- **Firebase Admin SDK**
- **JWT token verification**


### **✅ Completed:**
- User authentication system
- Product listing and management
- Shopping cart functionality
- Order processing system
- Role-based access control
- Responsive UI design
- Database schema and API

### **🚧 In Progress:**
- Payment integration
- Real-time notifications
- Image upload system
- Advanced analytics

### **📋 Planned:**
- Mobile app development
- Multi-language support
- Advanced search algorithms
- Delivery tracking
- Farmer verification system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request


**Built with ❤️ for Ethiopian Farmers**

## 🔧 Local Development

1) Server setup
- Copy `server/.env.example` to `server/.env` and fill values (MySQL + Firebase Admin).
- Create database and run schema: import `server/src/sql/schema.sql` into your MySQL `DB_NAME`.
- Install deps and run:
  - `cd server && npm ci`
  - `npm run dev`

2) Client setup
- Copy `client/.env.example` to `client/.env` and set `VITE_API_BASE_URL` to your API (e.g. `http://localhost:5000`).
- Configure Firebase Web keys.
- Install deps and run:
  - `cd client && npm install`
  - `npm run dev`

3) Auth
- After Firebase web sign-in, store the ID token in `localStorage` under `firebase_id_token` or wire automatic token storage; protected API routes require `Authorization: Bearer <token>`.

## 🚦 Key Routes
- Farmer dashboard: `/dashboard-farmer-home`
- Buyer dashboard: `/dashboard-buyer-home`
- Browse listings: `/browse-listings-buyer-home`
- Order management: `/order-management`
- Farmer listings (manage): `/farmer/listings`
