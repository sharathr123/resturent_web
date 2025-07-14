import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing without MongoDB connection for development');
    // Don't exit in development - continue with in-memory fallback
    return false;
  }
  return true;
};

// User Schema
const userSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' },
  phone: { type: String },
  avatar: { type: String },
  bio: { type: String },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date },
  socketId: { type: String },
  preferences: { type: mongoose.Schema.Types.Mixed },
  settings: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  order: { type: Number },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  price: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  ingredients: [{ type: String }],
  allergens: [{ type: String }],
  tags: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number },
  calories: { type: Number },
  nutrition: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Order Schema
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: mongoose.Schema.Types.Mixed, required: true },
  total: { type: String, required: true },
  status: { type: String, default: 'pending' },
  paymentStatus: { type: String, default: 'pending' },
  deliveryAddress: { type: String },
  customerInfo: { type: mongoose.Schema.Types.Mixed },
  notes: { type: String },
  estimatedDeliveryTime: { type: Date },
}, {
  timestamps: true,
});

// Reservation Schema
const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  table: { type: Number },
  status: { type: String, default: 'pending' },
  customerInfo: { type: mongoose.Schema.Types.Mixed, required: true },
  notes: { type: String },
  specialRequests: { type: String },
  occasion: { type: String },
  contactMethod: { type: String },
  confirmationCode: { type: String, unique: true },
}, {
  timestamps: true,
});

// Chat Schema
const chatSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String },
  type: { type: String, default: 'private' },
  description: { type: String },
  image: { type: String },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: false },
  lastMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date },
  messageCount: { type: Number, default: 0 },
  maxParticipants: { type: Number },
  settings: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Chat Participant Schema
const chatParticipantSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, default: 'member' },
  isActive: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date },
  lastReadMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastReadAt: { type: Date },
  notificationSettings: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Message Schema
const messageSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  messageType: { type: String, default: 'text' },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: Number },
  fileMimeType: { type: String },
  replyToMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Message Reaction Schema
const messageReactionSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true },
}, {
  timestamps: true,
});

// Message Status Schema
const messageStatusSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, required: true },
}, {
  timestamps: true,
});

// User Connection Schema
const userConnectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  connectedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  blockedAt: { type: Date },
}, {
  timestamps: true,
});

// Create indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ isOnline: 1 });
userSchema.index({ lastSeen: 1 });

chatSchema.index({ creatorId: 1 });
chatSchema.index({ isActive: 1 });
chatSchema.index({ lastMessageAt: -1 });

chatParticipantSchema.index({ chatId: 1, userId: 1 });
chatParticipantSchema.index({ userId: 1, isActive: 1 });

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ chatId: 1, isDeleted: 1, createdAt: -1 });

messageReactionSchema.index({ messageId: 1 });
messageReactionSchema.index({ userId: 1 });

messageStatusSchema.index({ messageId: 1 });
messageStatusSchema.index({ userId: 1 });

userConnectionSchema.index({ userId: 1 });
userConnectionSchema.index({ connectedUserId: 1 });
userConnectionSchema.index({ status: 1 });

// Export models
export const User = mongoose.model('User', userSchema);
export const Category = mongoose.model('Category', categorySchema);
export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Reservation = mongoose.model('Reservation', reservationSchema);
export const Chat = mongoose.model('Chat', chatSchema);
export const ChatParticipant = mongoose.model('ChatParticipant', chatParticipantSchema);
export const Message = mongoose.model('Message', messageSchema);
export const MessageReaction = mongoose.model('MessageReaction', messageReactionSchema);
export const MessageStatus = mongoose.model('MessageStatus', messageStatusSchema);
export const UserConnection = mongoose.model('UserConnection', userConnectionSchema);