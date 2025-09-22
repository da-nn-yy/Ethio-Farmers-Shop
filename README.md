# 🌾 Ke geberew - Ethiopian Agricultural Marketplace

A comprehensive digital platform connecting Ethiopian farmers directly with buyers, eliminating intermediaries and ensuring fair prices for agricultural products. Built with modern web technologies and designed specifically for the Ethiopian agricultural ecosystem.

## 🎯 Project Overview

Ke geberew is a full-stack e-commerce solution that empowers Ethiopian farmers to sell their produce directly to buyers while providing buyers with access to fresh, locally-sourced agricultural products. The platform features role-based access control, secure authentication, and a user-friendly interface available in both English and Amharic.

## ✨ Key Features

### 🌱 **For Farmers**
- **Product Management**: Create, edit, and manage agricultural product listings
- **Inventory Tracking**: Real-time inventory management and stock updates
- **Order Management**: Comprehensive order processing and status tracking
- **Analytics Dashboard**: Detailed insights into sales, performance, and market trends
- **Profile Management**: Complete farmer profile with farm details and certifications
- **Market Trends**: Access to pricing trends and seasonal insights
- **Review System**: Manage and respond to buyer reviews

### 🛒 **For Buyers**
- **Product Discovery**: Browse fresh produce with advanced search and filtering
- **Shopping Cart**: Seamless shopping experience with cart management
- **Order Tracking**: Real-time order status updates and history
- **Favorites System**: Save preferred products and farmers
- **Review & Rating**: Rate and review products and farmers
- **Payment Processing**: Secure checkout with multiple payment options
- **Market Analysis**: Access to market trends and pricing insights

### 🔧 **Platform Features**
- **Dual Authentication**: Firebase integration with development fallback
- **Role-Based Access**: Secure access control for farmers, buyers, and admins
- **Multi-Language Support**: Full English and Amharic localization
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-Time Updates**: Live notifications and status updates
- **Password Recovery**: Secure forgot password functionality
- **Profile Management**: Comprehensive user profile system
- **Document Verification**: Optional document upload and verification

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern UI library with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful icon library

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MySQL** - Relational database management
- **Firebase Admin SDK** - Authentication and user management
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling

### **Development Tools**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Git** - Version control
- **XAMPP** - Local development environment

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- XAMPP or similar local development environment
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ethio-farmers-shop.git
   cd ethio-farmers-shop
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Database Setup**
   ```bash
   # Start MySQL service (XAMPP)
   # Create database named 'ke_geberew'
   # Import the schema
   mysql -u root -p ke_geberew < server/src/sql/schema.sql
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment files
   cp client/env.example client/.env
   cp server/env.example server/.env
   
   # Configure your environment variables
   # Update database credentials and Firebase configuration
   ```

5. **Start the application**
   ```bash
   # Start backend server
   cd server
   npm run dev
   
   # Start frontend (in new terminal)
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
ethio-farmers-shop/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── styles/         # CSS and styling
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js backend application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   └── sql/            # Database schema
│   ├── uploads/            # File upload directory
│   └── package.json
└── README.md
```

## 🔐 Authentication & Security

- **Firebase Authentication** for production environments
- **Development mode** with local authentication for testing
- **JWT token-based** API authentication
- **Role-based access control** (Farmer, Buyer, Admin)
- **Password reset functionality** with secure token system
- **Input validation** and sanitization
- **CORS protection** and security headers

## 🌐 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/dev-login` - Development login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-reset-token/:token` - Verify reset token

### **User Management**
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `POST /api/users/me/avatar` - Upload user avatar

### **Product Listings**
- `GET /api/listings/active` - Get active listings
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### **Orders**
- `POST /api/orders` - Create new order
- `GET /api/orders/buyer` - Get buyer orders
- `GET /api/orders/farmer` - Get farmer orders
- `PATCH /api/orders/:id/status` - Update order status

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface with Tailwind CSS
- **Responsive Layout**: Optimized for all device sizes
- **Dark/Light Theme**: User preference support
- **Loading States**: Smooth loading animations and feedback
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Accessibility**: WCAG compliant design patterns

## 🌍 Localization

- **English**: Primary language with complete translations
- **Amharic**: Full Amharic language support
- **Dynamic Language Switching**: Real-time language changes
- **Cultural Adaptation**: Ethiopian-specific content and formatting

## 🧪 Testing

### **Development Testing**
- Manual testing with development authentication
- API endpoint testing with Postman/curl
- Cross-browser compatibility testing
- Mobile responsiveness testing

### **Production Testing**
- Firebase authentication integration
- Database performance testing
- Security vulnerability assessment
- User acceptance testing

## 📊 Performance

- **Frontend**: Optimized with Vite and code splitting
- **Backend**: Efficient database queries and caching
- **Images**: Optimized image handling and compression
- **API**: RESTful design with proper HTTP status codes

## 🚀 Deployment

### **Frontend Deployment**
- Build optimized production bundle
- Deploy to Vercel, Netlify, or similar platform
- Configure environment variables
- Set up custom domain (optional)

### **Backend Deployment**
- Deploy to Heroku, DigitalOcean, or AWS
- Configure production database
- Set up environment variables
- Configure Firebase Admin SDK

## 🤝 Contributing

We welcome contributions to Ke geberew! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow the existing code style and conventions
- Write clear commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethiopian Farmers**: For their dedication and hard work
- **Open Source Community**: For the amazing tools and libraries
- **Contributors**: Everyone who has helped build this platform

## 📞 Support

For support, email support@kegeberew.et or create an issue in the repository.

---

**Built with ❤️ for Ethiopian Farmers and Agricultural Communities**

*Empowering farmers, connecting communities, growing together.*