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

## 📁 Project Structure

```
Ethio-Farmers-Shop/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.jsx         # Main app component
│   └── package.json
├── server/                 # Backend Node.js app
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── routes/             # API routes
│   ├── config/             # Configuration files
│   ├── database/           # Database schema
│   └── index.js            # Server entry point
└── README.md
```

## 🚀 Getting Started

### **Prerequisites:**
- Node.js (v16 or higher)
- MySQL database
- Firebase project

### **1. Clone the Repository:**
```bash
git clone <repository-url>
cd Ethio-Farmers-Shop
```

### **2. Backend Setup:**
```bash
cd server
npm install
```

### **3. Database Setup:**
1. Create a MySQL database
2. Update `.env` file with database credentials
3. Run the schema:
```bash
mysql -u your_username -p your_database < database/schema.sql
```

### **4. Environment Variables:**
Create `.env` file in the server directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ethio_farmers
FIREBASE_PROJECT_ID=your_project_id
```

### **5. Frontend Setup:**
```bash
cd client
npm install
```

### **6. Start Development Servers:**
```bash
# Backend (from server directory)
npm run dev

# Frontend (from client directory)
npm run dev
```

## 📊 Database Schema

### **Core Tables:**
- **users** - User accounts with roles (farmer/buyer)
- **products** - Product listings with inventory
- **cart** - Shopping cart items
- **orders** - Order management
- **order_items** - Individual items in orders
- **reviews** - Product reviews and ratings
- **favorites** - User favorite products

## 🔌 API Endpoints

### **Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Products:**
- `GET /api/products/search` - Search products
- `GET /api/products/categories` - Get categories
- `GET /api/products/featured` - Featured products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (farmer only)
- `PUT /api/products/:id` - Update product (farmer only)
- `DELETE /api/products/:id` - Delete product (farmer only)

### **Orders:**
- `GET /api/orders/cart` - Get shopping cart
- `POST /api/orders/cart/add` - Add to cart
- `POST /api/orders/checkout` - Create order
- `GET /api/orders/my-orders` - User orders
- `GET /api/orders/farmer/orders` - Farmer orders

## 🎯 Current Status

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

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for Ethiopian Farmers**
