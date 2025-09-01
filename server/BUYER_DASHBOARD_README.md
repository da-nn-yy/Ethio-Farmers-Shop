# 🛒 Buyer Dashboard - EthioFarm Connect

## Overview
The Buyer Dashboard provides a comprehensive shopping experience for buyers to browse, search, and order fresh produce directly from Ethiopian farmers.

## ✨ Features

### 🔍 Advanced Search & Filtering
- **Text Search**: Search by produce name (English/Amharic) or location
- **Category Filter**: Filter by vegetables, fruits, grains, legumes, spices
- **Regional Filter**: Filter by Ethiopian regions (Addis Ababa, Oromia, Amhara, etc.)
- **Price Range**: Set minimum and maximum price per kg
- **Sorting Options**: Newest, oldest, price low-to-high, price high-to-low

### 🛍️ Shopping Experience
- **Browse Listings**: View all available produce with images and details
- **Real-time Availability**: See current stock levels and status
- **Farmer Information**: View farmer details, ratings, and contact info
- **Add to Cart**: Add multiple items with quantity selection
- **Shopping Cart**: Manage cart items, update quantities, remove items

### 📦 Order Management
- **Place Orders**: Order directly from cart with notes
- **Order Tracking**: Monitor order status (pending → confirmed → fulfilled)
- **Order History**: View all past and current orders
- **Cancel Orders**: Cancel pending orders (with quantity restoration)

### 🌍 Bilingual Support
- **English/Amharic**: Full interface in both languages
- **Localized Content**: Ethiopian regional names and cultural context
- **Currency**: Prices in Ethiopian Birr (ETB)

## 🚀 API Endpoints

### Listings
```
GET /listings/active          - Get all active listings
GET /listings/:id             - Get specific listing details
GET /listings/search          - Search with filters
GET /listings/category/:cat   - Get listings by category
GET /listings/region/:region  - Get listings by region
```

### Orders
```
POST   /orders                - Create new order
GET    /orders/buyer          - Get buyer's orders
GET    /orders/:id            - Get specific order
PATCH  /orders/:id/status     - Update order status (farmer)
PATCH  /orders/:id/cancel     - Cancel order (buyer)
```

## 🗄️ Database Schema

### Produce Listings
```sql
- id, farmer_id, name, name_am, description, description_am
- category (vegetables, fruits, grains, legumes, spices)
- price_per_kg, available_quantity, image_url
- location, status, created_at, updated_at
```

### Orders
```sql
- id, buyer_id, listing_id, quantity, total_price
- status (pending, confirmed, in_progress, completed, cancelled)
- notes, created_at, updated_at
```

## 🔧 Setup Instructions

### 1. Database Setup
```bash
# Run the schema file
mysql -u your_user -p farmconnect < database/schema.sql
```

### 2. Environment Variables
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=farmconnect
```

### 3. Start Server
```bash
cd server
npm install
npm run dev
```

## 🎯 Usage Examples

### Search for Tomatoes in Addis Ababa
```javascript
const response = await axios.get('/listings/search', {
  params: {
    query: 'tomatoes',
    region: 'Addis Ababa',
    category: 'vegetables',
    minPrice: 10,
    maxPrice: 30
  }
});
```

### Place an Order
```javascript
const order = await axios.post('/orders', {
  listingId: 123,
  quantity: 5,
  totalPrice: 90,
  notes: 'Please deliver in the morning'
});
```

## 🌟 Key Benefits

1. **Direct Connection**: Buyers connect directly with farmers
2. **Fresh Produce**: Real-time availability and status updates
3. **Fair Pricing**: Transparent pricing without intermediaries
4. **Local Support**: Ethiopian regions and Amharic language
5. **Secure Orders**: Transaction safety with database integrity
6. **Mobile Ready**: Responsive design for all devices

## 🔒 Security Features

- **Authentication Required**: All order operations require valid Firebase tokens
- **User Authorization**: Users can only access their own orders
- **Transaction Safety**: Database transactions ensure data consistency
- **Input Validation**: All inputs are validated and sanitized

## 🚧 Future Enhancements

- **Real-time Chat**: Direct messaging between buyers and farmers
- **Payment Integration**: Secure payment processing
- **Delivery Tracking**: Real-time delivery status updates
- **Push Notifications**: Order status and availability alerts
- **Review System**: Rate and review farmers and produce
- **Favorites**: Save favorite farmers and produce items

## 📱 Frontend Components

- **SearchFilters**: Advanced search and filtering interface
- **ProduceGrid**: Responsive grid of produce listings
- **ShoppingCart**: Cart management with quantity controls
- **OrderHistory**: Complete order tracking and management
- **FarmerProfile**: Detailed farmer information and ratings

---

**Built with ❤️ for Ethiopian Farmers and Buyers**

