import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertOrderSchema, 
  insertReservationSchema, 
  insertMenuItemSchema, 
  insertCategorySchema,
  insertChatSchema,
  insertMessageSchema,
  type User 
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware for JWT authentication
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const userData = insertUserSchema.parse({
        email,
        password: hashedPassword,
        name,
        role: 'customer'
      });

      const user = await storage.createUser(userData);
      
      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        data: {
          token,
          data: userWithoutPassword
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ success: false, error: 'Invalid credentials' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ success: false, error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        data: {
          token,
          data: userWithoutPassword
        }
      });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ success: true, data: userWithoutPassword });
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', authenticateToken, async (req: any, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json({ success: true, data: category });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to create category' });
    }
  });

  // Menu items routes
  app.get('/api/menu-items', async (req, res) => {
    try {
      const categoryId = req.query.category ? parseInt(req.query.category as string) : undefined;
      const menuItems = await storage.getMenuItems(categoryId);
      res.json({ success: true, data: menuItems });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch menu items' });
    }
  });

  app.get('/api/menu-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ success: false, error: 'Menu item not found' });
      }
      res.json({ success: true, data: menuItem });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch menu item' });
    }
  });

  app.get('/api/menu-items/featured', async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      const featuredItems = menuItems.slice(0, 6); // Return first 6 items as featured
      res.json({ success: true, data: featuredItems });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch featured items' });
    }
  });

  app.get('/api/menu-items/popular', async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      const popularItems = menuItems.slice(0, 8); // Return first 8 items as popular
      res.json({ success: true, data: popularItems });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch popular items' });
    }
  });

  app.post('/api/menu-items', authenticateToken, async (req: any, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(menuItemData);
      res.json({ success: true, data: menuItem });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to create menu item' });
    }
  });

  // Orders routes
  app.get('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const status = req.query.status as string;
      const orders = await storage.getOrders(req.user.id, status);
      res.json({ success: true, data: { data: orders } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
  });

  app.get('/api/orders/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order || order.userId !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
  });

  app.post('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const orderData = {
        ...req.body,
        userId: req.user.id,
        total: req.body.total || "0.00"
      };
      
      const validatedData = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedData);
      res.json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to create order' });
    }
  });

  app.patch('/api/orders/:id/cancel', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order || order.userId !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      
      const updatedOrder = await storage.updateOrder(id, { status: 'cancelled' });
      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to cancel order' });
    }
  });

  // Reservations routes
  app.get('/api/reservations', authenticateToken, async (req: any, res) => {
    try {
      const reservations = await storage.getReservations(req.user.id);
      res.json({ success: true, data: { data: reservations } });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch reservations' });
    }
  });

  app.get('/api/reservations/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservation = await storage.getReservation(id);
      if (!reservation || reservation.userId !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }
      res.json({ success: true, data: reservation });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch reservation' });
    }
  });

  app.post('/api/reservations', authenticateToken, async (req: any, res) => {
    try {
      const reservationData = {
        ...req.body,
        userId: req.user.id
      };
      
      const validatedData = insertReservationSchema.parse(reservationData);
      const reservation = await storage.createReservation(validatedData);
      res.json({ success: true, data: reservation });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to create reservation' });
    }
  });

  app.patch('/api/reservations/:id/cancel', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const reservation = await storage.getReservation(id);
      if (!reservation || reservation.userId !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }
      
      const updatedReservation = await storage.updateReservation(id, { status: 'cancelled' });
      res.json({ success: true, data: updatedReservation });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to cancel reservation' });
    }
  });

  // Available time slots for reservations
  app.get('/api/reservations/available-slots', async (req, res) => {
    try {
      const { date, guests } = req.query;
      // Mock available time slots
      const availableSlots = [
        "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
        "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
      ];
      res.json({ success: true, data: availableSlots });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch available slots' });
    }
  });

  // Chats routes
  app.get('/api/chats', authenticateToken, async (req: any, res) => {
    try {
      const chats = await storage.getChats(req.user.id);
      res.json({ success: true, data: chats });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch chats' });
    }
  });

  app.get('/api/chats/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const chat = await storage.getChat(id);
      if (!chat) {
        return res.status(404).json({ success: false, error: 'Chat not found' });
      }
      res.json({ success: true, data: chat });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch chat' });
    }
  });

  app.post('/api/chats', authenticateToken, async (req: any, res) => {
    try {
      const chatData = insertChatSchema.parse(req.body);
      const chat = await storage.createChat(chatData);
      res.json({ success: true, data: chat });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to create chat' });
    }
  });

  // Messages routes
  app.get('/api/chats/:chatId/messages', authenticateToken, async (req: any, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const messages = await storage.getMessages(chatId);
      res.json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/chats/:chatId/messages', authenticateToken, async (req: any, res) => {
    try {
      const chatId = parseInt(req.params.chatId);
      const messageData = {
        ...req.body,
        chatId,
        senderId: req.user.id
      };
      
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.createMessage(validatedData);
      res.json({ success: true, data: message });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to send message' });
    }
  });

  // User routes
  app.get('/api/users/online', authenticateToken, async (req: any, res) => {
    try {
      // Mock online users - in real app this would track actual online status
      res.json({ success: true, data: [] });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch online users' });
    }
  });

  app.get('/api/users/search', authenticateToken, async (req: any, res) => {
    try {
      const { query } = req.query;
      // Mock user search - in real app this would search actual users
      res.json({ success: true, data: [] });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to search users' });
    }
  });

  app.patch('/api/users/profile', authenticateToken, async (req: any, res) => {
    try {
      const updates = req.body;
      const updatedUser = await storage.updateUser(req.user.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ success: true, data: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Failed to update profile' });
    }
  });

  // Analytics routes (for admin)
  app.get('/api/analytics', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      
      // Mock analytics data
      const analytics = {
        dailyOrders: 25,
        totalRevenue: 1500.00,
        averageOrderValue: 60.00,
        customerCount: 150,
        topSellingItems: [],
        orderTrends: []
      };
      
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
  });

  const httpServer = createServer(app);
  
  // Setup Socket.IO
  const io = new SocketServer(httpServer, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return httpServer;
}
