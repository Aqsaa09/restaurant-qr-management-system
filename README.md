Restaurant QR Management System

A full-stack restaurant ordering and management system that enables customers to scan table-specific QR codes, browse a digital menu, place orders, track order status, and receive bills. Restaurant staff can manage menus, tables, orders, and customer feedback through an admin dashboard.

✨ Features
Customer Features
Table-specific QR code access
Digital menu with categories, images, and descriptions
Shopping cart with quantity management
Order placement
Real-time order status updates
Bill generation
Service requests / call waiter
Customer feedback
Interactive customer game
Admin Features
Secure admin authentication
Protected admin routes
Restaurant activity dashboard
Menu management
Table management and QR codes
Order management and status updates
Customer feedback management
Real-time order notifications
🔄 How It Works

Customer scans table QR code
↓
Table-specific menu opens
↓
Customer browses and adds items
↓
Customer places order
↓
Restaurant receives the order
↓
Admin updates order status
↓
Customer receives real-time updates
↓
Bill is generated

🛠️ Tech Stack
Frontend
React 19
Vite
React Router
Axios
Context API
Socket.IO Client
Framer Motion
HTML2Canvas
React Icons
Backend
Node.js
Express.js
MongoDB
Mongoose
Socket.IO
JWT Authentication
bcryptjs
Multer
Tools
Git & GitHub
Postman
VS Code
🏗️ Project Structure
backend/ — Server, API routes, database models and authentication
frontend/ — React application, pages, components and styling
README.md — Project documentation
🚀 Getting Started
Prerequisites
Node.js
MongoDB
npm
Clone the Repository
git clone https://github.com/Aqsaa09/restaurant-qr-management-system.git
cd restaurant-qr-management-system
Backend Setup
cd backend
npm install

Create a .env file inside the backend directory:

PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development

Start the backend:

npm run dev
Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev
📡 Real-Time Communication

Socket.IO is used for real-time communication between customers and restaurant staff, including:

Real-time order notifications
Order status updates
Table-based communication
Customer service requests such as calling a waiter
🔐 Security
JWT-based authentication
Password hashing with bcryptjs
Protected admin routes
Environment variables for sensitive configuration
CORS configuration
Database validation
👩‍💻 My Contribution

I worked primarily on the frontend of the project, including the React application structure, customer-facing interfaces, admin interfaces, state management, responsive UI, and integration with backend APIs.

📚 Key Learning Areas
React component-based development
Context API and state management
REST API integration
Express.js backend development
MongoDB and Mongoose
Authentication and protected routes
Socket.IO real-time communication
QR-based table workflows
Git and GitHub
📄 License

This project is licensed under the MIT License.
