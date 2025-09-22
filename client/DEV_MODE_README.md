# Dev Mode System - Ethio Farmers Shop

## Overview

The Dev Mode system provides a comprehensive development and testing environment for the Ethio Farmers Shop application. It includes a floating dev mode button that allows developers to quickly switch between different user roles and access all admin functionalities.

## Features

### 🔧 Dev Mode Toggle
- **Floating Button**: Fixed position button in bottom-right corner
- **Role Switching**: Quick access to admin, farmer, and buyer roles
- **Dev Key Authentication**: Simple key-based authentication for development
- **Visual Status**: Button shows current dev mode status and role

### 👨‍💼 Admin Dashboard
- **Overview Statistics**: Total users, listings, orders, and revenue
- **User Management**: Complete user administration with search and filters
- **Listing Management**: Product listing approval and management
- **Order Management**: Order tracking and status updates
- **Analytics**: Comprehensive system analytics and reporting
- **Settings**: System configuration and feature toggles

### 🚀 Quick Access
- **One-Click Login**: Instant access to any role without complex setup
- **Persistent State**: Dev mode state persists across page refreshes
- **Auto-Navigation**: Automatically redirects to appropriate dashboard

## Usage

### 1. Accessing Dev Mode

1. Look for the floating "Dev Mode" button in the bottom-right corner
2. Click the button to open the dev mode modal
3. Select your desired role (admin, farmer, or buyer)
4. Enter one of the dev keys:
   - `dev123`
   - `admin123`
   - `test123`
   - `ethiofarm`
5. Click "Enter Dev Mode"

### 2. Available Roles

#### Admin Role
- **Dashboard**: `/admin-dashboard`
- **User Management**: `/admin-users`
- **Listing Management**: `/admin-listings`
- **Order Management**: `/admin-orders`
- **Analytics**: `/admin-analytics`
- **Settings**: `/admin-settings`

#### Farmer Role
- **Dashboard**: `/dashboard-farmer-home`
- **My Listings**: `/farmer-my-listings`
- **Orders**: `/order-management`
- **Market Trends**: `/farmer-market-trends`
- **Reviews**: `/farmer-reviews`

#### Buyer Role
- **Dashboard**: `/dashboard-buyer-home`
- **Browse Listings**: `/browse-listings-buyer-home`
- **Cart**: `/cart`
- **Orders**: `/order-management`
- **Favorites**: `/favorites`
- **Market Trends**: `/buyer-market-trends`

### 3. Exiting Dev Mode

- Click the "Dev Mode" button again (it will show current role)
- Click "Exit Dev Mode" to return to normal authentication

## Admin Features

### Dashboard Overview
- **Real-time Statistics**: Users, listings, orders, revenue
- **Growth Metrics**: Percentage changes and trends
- **Quick Actions**: Direct access to management pages
- **Recent Activity**: Live feed of system activity

### User Management
- **Search & Filter**: Find users by name, email, phone, role, status
- **Bulk Actions**: Suspend, activate, or delete multiple users
- **User Details**: Complete user profile information
- **Role Management**: Assign and modify user roles

### Listing Management
- **Approval Workflow**: Approve or reject new listings
- **Status Management**: Activate, suspend, or delete listings
- **Search & Filter**: Find listings by title, farmer, category, status
- **Performance Metrics**: Views, orders, and ratings for each listing

### Order Management
- **Status Tracking**: Monitor order progress from pending to delivered
- **Bulk Actions**: Update multiple orders simultaneously
- **Search & Filter**: Find orders by number, buyer, farmer, status, date
- **Order Details**: Complete order information and history

### Analytics
- **Revenue Analytics**: Daily, monthly, and yearly revenue trends
- **Order Analytics**: Order volume and growth metrics
- **User Analytics**: User registration and activity trends
- **Top Performers**: Best products, farmers, and buyers
- **Regional Statistics**: Performance by geographic region

### Settings
- **General Settings**: Site name, description, contact information
- **Business Settings**: Commission rates, order limits, delivery radius
- **Notification Settings**: Email, SMS, and push notification preferences
- **Security Settings**: Authentication requirements and session management
- **Feature Toggles**: Enable/disable system features

## Technical Implementation

### Components
- `DevMode.jsx`: Main dev mode toggle component
- `AdminDashboard.jsx`: Admin dashboard overview
- `AdminUsers.jsx`: User management interface
- `AdminListings.jsx`: Listing management interface
- `AdminOrders.jsx`: Order management interface
- `AdminAnalytics.jsx`: Analytics and reporting
- `AdminSettings.jsx`: System configuration

### Services
- `adminService.js`: API service for admin operations
- Enhanced `useAuth.jsx`: Dev mode authentication support
- Updated `Routes.jsx`: Admin route protection

### Authentication
- **Dev Token System**: Simple token-based authentication for development
- **Role-based Access**: Automatic redirection based on user role
- **Persistent State**: Dev mode state stored in localStorage
- **Fallback Handling**: Graceful fallback for non-dev environments

## Development Workflow

### 1. Testing Different Roles
1. Use dev mode to quickly switch between roles
2. Test role-specific features and permissions
3. Verify proper access control and navigation

### 2. Admin Testing
1. Access admin dashboard to test management features
2. Use mock data to test various scenarios
3. Verify analytics and reporting functionality

### 3. Integration Testing
1. Test complete user workflows across roles
2. Verify data consistency between different interfaces
3. Test error handling and edge cases

## Security Considerations

### Development Only
- Dev mode is only available in non-production environments
- Dev keys are simple and not secure for production use
- All dev mode data is mock data and not persistent

### Production Safety
- Dev mode components are automatically disabled in production
- Admin routes are protected by proper authentication
- All admin operations require valid authentication tokens

## Troubleshooting

### Common Issues

1. **Dev Mode Button Not Visible**
   - Ensure you're in development mode
   - Check browser console for errors
   - Verify component is properly imported

2. **Authentication Issues**
   - Clear localStorage and try again
   - Check if dev keys are correct
   - Verify role selection

3. **Navigation Problems**
   - Check if routes are properly configured
   - Verify role-based access control
   - Check browser console for errors

### Debug Information
- Dev mode state is stored in localStorage
- Check `devMode`, `devRole`, and `devUserData` keys
- Monitor network requests for API calls
- Check browser console for error messages

## Future Enhancements

### Planned Features
- **Data Seeding**: Automatic test data generation
- **Scenario Testing**: Predefined test scenarios
- **Performance Monitoring**: Real-time performance metrics
- **API Mocking**: Complete API simulation for testing
- **Automated Testing**: Integration with testing frameworks

### Customization
- **Custom Dev Keys**: Configurable authentication keys
- **Role Customization**: Custom role definitions
- **Feature Flags**: Granular feature control
- **Theme Switching**: Development theme options

## Support

For issues or questions regarding the dev mode system:
1. Check this documentation first
2. Review browser console for errors
3. Verify component imports and routes
4. Test with different browsers and devices

---

**Note**: This dev mode system is designed for development and testing purposes only. It should never be used in production environments.
