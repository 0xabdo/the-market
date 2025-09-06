// Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

// Environment variables loaded successfully

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const {
  corsOptions,
  validateApiKey,
  validateOrigin,
  securityHeaders,
  requestSizeLimit,
  ipWhitelist,
  validateRequest,
  securityLogger,
  generalRateLimit,
  authRateLimit,
  uploadRateLimit,
  speedLimiter
} = require('./middleware/security');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Security Middleware (applied in order)
app.use(securityLogger);
app.use(securityHeaders);
app.use(requestSizeLimit);
app.use(validateRequest);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(speedLimiter);
app.use(generalRateLimit);

// API Key validation for all API routes
app.use('/api', validateApiKey);
app.use('/api', validateOrigin);

// Specific rate limits for sensitive endpoints
app.use('/api/auth', authRateLimit);
app.use('/api/upload', uploadRateLimit);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/security', require('./routes/security'));

// Store active connections
const activeConnections = new Map();

// Socket.io for real-time messaging
io.on('connection', async (socket) => {
  let userId = null;
  let heartbeatInterval = null;

  // Authenticate user on connection
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
      
      // Store the connection
      activeConnections.set(userId, {
        socketId: socket.id,
        lastSeen: new Date()
      });
      
      // Update user's online status
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      // Join user to their personal room
      socket.join(`user_${userId}`);
      
      // Broadcast user online status to relevant users
      socket.broadcast.emit('user_online', { userId });

      // Set up heartbeat
      heartbeatInterval = setInterval(async () => {
        if (activeConnections.has(userId)) {
          activeConnections.set(userId, {
            socketId: socket.id,
            lastSeen: new Date()
          });
          
          // Update lastSeen in database
          await User.findByIdAndUpdate(userId, {
            lastSeen: new Date()
          });
        }
      }, 30000); // Update every 30 seconds
      
    } catch (error) {
      socket.emit('auth_error', { message: 'Invalid token' });
    }
  });

  socket.on('heartbeat', async () => {
    if (userId && activeConnections.has(userId)) {
      activeConnections.set(userId, {
        socketId: socket.id,
        lastSeen: new Date()
      });
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', async () => {
    if (userId) {
      try {
        // Remove from active connections
        activeConnections.delete(userId);
        
        // Clear heartbeat interval
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        
        // Update user's offline status
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date()
        });

        // Broadcast user offline status to relevant users
        socket.broadcast.emit('user_offline', { userId });
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    }
  });
});

// Cleanup job to mark users as offline if they haven't been seen recently
setInterval(async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Find users who are marked as online but haven't been seen recently
    const staleUsers = await User.find({
      isOnline: true,
      lastSeen: { $lt: fiveMinutesAgo }
    });

    if (staleUsers.length > 0) {
      const userIds = staleUsers.map(user => user._id);
      
      // Mark them as offline
      await User.updateMany(
        { _id: { $in: userIds } },
        { isOnline: false }
      );

      // Remove from active connections
      userIds.forEach(userId => {
        activeConnections.delete(userId.toString());
      });

      console.log(`Marked ${staleUsers.length} users as offline due to inactivity`);
    }
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
}, 60000); // Run every minute

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gaming-marketplace')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}`);
});
