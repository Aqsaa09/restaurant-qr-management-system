# Restaurant QR Code Ordering System

A full-stack web application that enables contactless restaurant ordering through QR codes. Customers scan QR codes at their tables to access a digital menu, place orders, and track order status in real-time.

## 🚀 Features

### Customer Features
- **QR Code Scanning**: Access table-specific menus by scanning QR codes
- **Digital Menu**: Browse categorized menu items with images and descriptions
- **Shopping Cart**: Add/remove items with quantity controls
- **Real-time Order Tracking**: Live updates on order status
- **Contact & Feedback**: Direct communication with restaurant staff

### Admin Features
- **Dashboard**: Overview of orders, revenue, and table status
- **Order Management**: Real-time order processing and status updates
- **Menu Management**: Add, edit, and delete menu items
- **Table Management**: Monitor table occupancy and QR codes

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads

### Frontend
- **React 19.2.0** with Vite build tool
- **React Router DOM** for navigation
- **Axios** for API calls
- **Socket.IO Client** for real-time updates
- **React Context API** for state management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd restaurant-qr-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/restaurant-qr
NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Database Setup

Make sure MongoDB is running on your system, then seed the database:
```bash
cd backend
node seedData.js
```

This will create sample menu items and tables with QR codes.

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
# or
npm start
```
Backend will run on `http://localhost:5001`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## 📱 Usage

### For Customers
1. Scan the QR code at your table (or visit `/demo` for demo mode)
2. Browse the digital menu by categories
3. Add items to your cart
4. Place your order with customer details
5. Track your order status in real-time

### For Restaurant Staff
1. Visit `http://localhost:3000/admin/login`
2. Login with demo credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Manage orders, menu items, and tables from the dashboard

## 🗂️ Project Structure

```
restaurant-qr-system/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── server.js        # Main server file
│   ├── seedData.js      # Database seeding script
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── features/    # Customer & Admin pages
│   │   ├── context/     # React Context for state management
│   │   ├── services/    # API calls
│   │   └── assets/      # Images and styles
│   ├── index.html
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Menu Routes
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get specific menu item
- `GET /api/menu/categories/all` - Get all categories

### Order Routes
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/track/:orderNumber` - Track order
- `PATCH /api/orders/:id/status` - Update order status

### Table Routes
- `GET /api/tables/qr/:qrCode` - Get table by QR code
- `GET /api/tables/:id` - Get table by ID
- `GET /api/tables` - Get all tables

### Admin Routes
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/orders` - Get all orders with filters
- `POST /api/admin/menu` - Add new menu item
- `PUT /api/admin/menu/:id` - Update menu item
- `DELETE /api/admin/menu/:id` - Delete menu item

## 🔄 Real-time Features

The application uses Socket.IO for real-time communication:

- **Order Notifications**: Instant notifications to kitchen staff when orders are placed
- **Status Updates**: Real-time order status updates to customers
- **Table Management**: Live table occupancy updates

## 🎨 Customization

### Adding New Menu Items
1. Use the admin dashboard to add items through the UI, or
2. Modify the `seedData.js` file and re-run the seeding script

### Styling
- CSS files are located in `frontend/src/assets/styles/`
- The design uses a modern gradient-based theme
- Responsive design works on mobile and desktop

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check the connection string in `.env`

2. **Port Already in Use**
   - Change the PORT in backend `.env` file
   - Update API_BASE_URL in `frontend/src/services/api.js`

3. **Socket.IO Connection Issues**
   - Ensure backend and frontend ports match
   - Check CORS configuration in `server.js`

4. **Images Not Loading**
   - Images are stored in `frontend/src/assets/images/pictres/`
   - Ensure image paths are correct in menu data

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication for admin routes
- CORS configuration for cross-origin requests
- Input validation through Mongoose schemas
- Protected admin routes with middleware

## 🚀 Deployment Considerations

For production deployment:

1. **Environment Variables**: Set production MongoDB URI and JWT secret
2. **HTTPS**: Enable HTTPS for QR code scanning to work on mobile devices
3. **Static Files**: Configure Express to serve React build files
4. **Database**: Use MongoDB Atlas or similar cloud database
5. **Image Storage**: Consider using cloud storage for menu item images

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Happy Ordering! 🍽️**