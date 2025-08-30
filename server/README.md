# EthioFarm Connect - Server Setup

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the server directory with:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=farmconnect
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   ```

3. **Database Setup:**
   - Create a MySQL database named `farmconnect`
   - Import the database schema (see `database/schema.sql`)
   - Update `.env` with your database credentials

4. **Firebase Setup:**
   - Download your Firebase service account key
   - Save it as `serviceAccountKey.json` in the server directory

5. **Start the server:**
   ```bash
   npm run dev
   ```

## 📊 API Endpoints

### Farmer Dashboard
- `GET /farmer/metrics` - Get farmer dashboard metrics
- `GET /farmer/listings` - Get farmer's produce listings
- `GET /farmer/orders` - Get farmer's orders
- `GET /farmer/activity` - Get recent activity feed

### Authentication
- `POST /auth/sync` - Sync user with Firebase
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update user profile

## 🗄️ Database Schema

The application expects these tables:
- `users` - User profiles and authentication
- `produce_listings` - Farmer's produce listings
- `orders` - Orders between farmers and buyers
- `reviews` - Product reviews and ratings

## 🔧 Development

- **Hot reload:** `npm run dev`
- **Production:** `npm start`
- **Database connection:** Automatically tested on startup
