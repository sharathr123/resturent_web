// Core types for the restaurant application
export interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'staff';
  phone?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  socketId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  address: string;
  phone: string;
  email: string;
  hours: {
    open: string;
    close: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  image: string;
  price: number;
  categoryId: string;
  category?: Category;
  ingredients: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  preparationTime: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id?: string;
  id?: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  price: number;
}

export interface Order {
  _id?: string;
  id?: string;
  orderNumber?: string;
  userId: string;
  user?: User;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  deliveryAddress?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  _id?: string;
  id?: string;
  userId: string;
  user?: User;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  time: string;
  guests: number;
  table?: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  specialRequests?: string;
  occasion?: string;
  seatingPreference?: string;
  notes?: string;
  confirmationCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id?: string;
  id?: string;
  senderId: string;
  sender?: User;
  content: string;
  chatId: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: 'sent' | 'delivered' | 'seen';
  deliveredTo?: Array<{
    userId: string;
    deliveredAt: string;
  }>;
  seenBy?: Array<{
    userId: string;
    seenAt: string;
  }>;
  replyTo?: string;
  isEdited?: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  userId: string;
  role: 'member' | 'admin';
  joinedAt: string;
  lastSeen: string;
  isPinned: boolean;
  unreadCount: number;
  mutedUntil?: string;
}

export interface Chat {
  _id?: string;
  id?: string;
  name?: string;
  type: 'direct' | 'group' | 'support';
  participants?: string[];
  participantDetails?: User[];
  messages?: Message[];
  lastMessage?: {
    content: string;
    senderId: string;
    messageType: 'text' | 'image' | 'file' | 'system';
    timestamp: string;
  };
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  image?: string;
  groupImage?: string;
  description?: string;
  isActive: boolean;
  settings?: {
    allowFileSharing: boolean;
    maxParticipants: number;
    onlyAdminsCanMessage: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  dailyOrders: number;
  totalRevenue: number;
  topSellingItems: {
    item: MenuItem;
    count: number;
  }[];
  averageOrderValue: number;
  customerCount: number;
  orderTrends: {
    date: string;
    orders: number;
    revenue: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SocketEvents {
  // Connection events
  connected: boolean;
  reconnected: boolean;
  connectionFailed: boolean;
  
  // Chat events
  newMessage: {
    chatId: string;
    message: Message;
    chat: Partial<Chat>;
  };
  newChat: Chat;
  userTyping: {
    chatId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  };
  messageStatusUpdate: {
    messageId: string;
    chatId: string;
    status: 'delivered' | 'seen';
    deliveredBy?: string;
    seenBy?: string;
    deliveredAt?: string;
    seenAt?: string;
  };
  messagesRead: {
    chatId: string;
    readBy: string;
    readAt: string;
  };
  userStatusChange: {
    userId: string;
    isOnline: boolean;
    lastSeen: string;
  };
  
  // Order events
  orderUpdate: {
    orderId: string;
    status: string;
    message: string;
  };
}