const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const { testConnection } = require('./config/db');

// Import routes
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const adminRoutes = require('./routes/admin');
const rewardsRoutes = require('./routes/rewards');
const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const serviceRequestRoutes = require('./routes/serviceRequests');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://restaurantqr-seven.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    callback(null, true); // Dev permissive
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Database Connection
if (process.env.DB_TYPE !== 'mongo') {
  testConnection().then(connected => {
    if (connected) {
      console.log('⚡ Primary database active: PostgreSQL (database: ' + (process.env.PG_DATABASE || 'restaurant') + ')');
    }
  });
} else {
  // MongoDB fallback connection
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-qr', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => {
    console.warn('MongoDB connection notice:', err.message);
  });
}

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-table', (tableId) => {
    socket.join(`table-${tableId}`);
    console.log(`Socket ${socket.id} joined table-${tableId}`);
  });
  
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log(`Socket ${socket.id} joined admin room`);
  });

  // Client calls waiter
  socket.on('call-waiter', (data) => {
    console.log('Waiter call event received:', data);
    io.to('admin').emit('waiter-call', data);
  });

  // Client requests bill
  socket.on('request-bill', (data) => {
    console.log('Bill request event received:', data);
    io.to('admin').emit('waiter-call', {
      ...data,
      request_type: 'request_bill',
      message: `Table ${data.tableNumber || data.tableId} has requested their final bill.`
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/service-requests', serviceRequestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Restaurant QR API is running',
    database: process.env.DB_TYPE || 'postgres',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});