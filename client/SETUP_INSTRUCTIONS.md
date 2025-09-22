# Setup Instructions for Ethio Farmers Shop

## Quick Fix for White Screen Issue

The white screen issue is likely caused by missing environment variables. Here's how to fix it:

### 1. Create Environment File

Create a file named `.env` in the `client` directory with the following content:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Firebase Configuration (optional - can use placeholder values for dev mode)
VITE_FIREBASE_API_KEY=placeholder_key
VITE_FIREBASE_AUTH_DOMAIN=placeholder.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=placeholder_project_id
VITE_FIREBASE_STORAGE_BUCKET=placeholder.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=placeholder_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
VITE_APP_NAME=Ethio-Farmers 
VITE_APP_VERSION=1.0.0
```

### 2. Start Development Server

```bash
cd client
npm run dev
```

### 3. Access Dev Mode

1. Look for the floating "Dev Mode" button in the bottom-right corner
2. Click it to open the dev mode modal
3. Select a role (admin, farmer, or buyer)
4. Enter one of these dev keys:
   - `dev123`
   - `admin123`
   - `test123`
   - `ethiofarm`
5. Click "Enter Dev Mode"

## Dev Mode Features

### Admin Access
- **Dashboard**: Overview with statistics and quick actions
- **User Management**: Search, filter, and manage users
- **Listing Management**: Approve, reject, and manage product listings
- **Order Management**: Track and update orders
- **Analytics**: Comprehensive reporting and insights
- **Settings**: System configuration and feature toggles

### Role Switching
- Instantly switch between admin, farmer, and buyer roles
- Each role has access to appropriate features and dashboards
- Persistent state across page refreshes

## Troubleshooting

### White Screen Issues
1. **Check Console**: Open browser developer tools (F12) and check for JavaScript errors
2. **Environment Variables**: Ensure `.env` file exists with proper values
3. **Dependencies**: Run `npm install` to ensure all packages are installed
4. **Port Conflicts**: Make sure port 5173 is available

### Common Errors
- **Firebase Errors**: These are normal if Firebase isn't configured - the app will work in dev mode
- **API Errors**: The app will work with mock data if the backend isn't running
- **Import Errors**: Check that all components are properly imported

### Development Tips
- Use the dev mode to test different user roles
- All admin features work with mock data
- The system is designed to work without a backend for development
- Check the browser console for any error messages

## File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── DevMode.jsx          # Dev mode toggle component
│   │   └── ui/                  # UI components
│   ├── pages/
│   │   ├── admin-dashboard/     # Admin dashboard
│   │   ├── admin-users/         # User management
│   │   ├── admin-listings/      # Listing management
│   │   ├── admin-orders/        # Order management
│   │   ├── admin-analytics/     # Analytics
│   │   └── admin-settings/      # Settings
│   ├── hooks/
│   │   ├── useAuth.jsx          # Authentication hook
│   │   ├── useLanguage.jsx      # Language hook
│   │   └── useCart.jsx          # Cart hook
│   └── services/
│       ├── apiService.js        # API service
│       └── adminService.js      # Admin API service
└── .env                         # Environment variables
```

## Support

If you continue to experience issues:
1. Check the browser console for error messages
2. Verify all files are properly saved
3. Try refreshing the page
4. Clear browser cache and localStorage
5. Restart the development server
