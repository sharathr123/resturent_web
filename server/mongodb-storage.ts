import { IStorage } from "./database-storage";
import { 
  User, Category, MenuItem, Order, Reservation, Chat, 
  ChatParticipant, Message, MessageReaction, MessageStatus, UserConnection 
} from "./mongodb";
import { v4 as uuidv4 } from 'uuid';
import type { 
  User as UserType, InsertUser, 
  Category as CategoryType, InsertCategory,
  MenuItem as MenuItemType, InsertMenuItem,
  Order as OrderType, InsertOrder,
  Reservation as ReservationType, InsertReservation,
  Chat as ChatType, InsertChat,
  ChatParticipant as ChatParticipantType, InsertChatParticipant,
  Message as MessageType, InsertMessage,
  MessageReaction as MessageReactionType, InsertMessageReaction,
  MessageStatus as MessageStatusType, InsertMessageStatus,
  UserConnection as UserConnectionType, InsertUserConnection
} from "@shared/schema";

export class MongoStorage implements IStorage {
  // Helper function to convert MongoDB document to expected format
  private toPlainObject(doc: any): any {
    if (!doc) return undefined;
    const obj = doc.toObject ? doc.toObject() : doc;
    if (obj._id) {
      obj.id = obj._id.toString();
      delete obj._id;
    }
    if (obj.__v !== undefined) {
      delete obj.__v;
    }
    return obj;
  }

  // Users
  async getUser(id: number): Promise<UserType | undefined> {
    const user = await User.findById(id);
    return user ? this.toPlainObject(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    const user = await User.findOne({ email });
    return user ? this.toPlainObject(user) : undefined;
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    const user = await User.findOne({ username });
    return user ? this.toPlainObject(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<UserType> {
    const userData = {
      ...insertUser,
      uuid: uuidv4(),
      username: insertUser.username || insertUser.email,
      isOnline: false,
      lastSeen: new Date(),
    };
    
    const user = new User(userData);
    await user.save();
    return this.toPlainObject(user);
  }

  async updateUser(id: number, updates: Partial<UserType>): Promise<UserType | undefined> {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    return user ? this.toPlainObject(user) : undefined;
  }

  async updateUserSocketId(id: number, socketId: string | null): Promise<void> {
    await User.findByIdAndUpdate(id, { socketId });
  }

  async setUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    const updateData: any = { isOnline };
    if (!isOnline) {
      updateData.lastSeen = new Date();
    }
    await User.findByIdAndUpdate(id, updateData);
  }

  async getOnlineUsers(): Promise<UserType[]> {
    const users = await User.find({ isOnline: true });
    return users.map(user => this.toPlainObject(user));
  }

  // Categories
  async getCategories(): Promise<CategoryType[]> {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    return categories.map(category => this.toPlainObject(category));
  }

  async getCategory(id: number): Promise<CategoryType | undefined> {
    const category = await Category.findById(id);
    return category ? this.toPlainObject(category) : undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<CategoryType> {
    const category = new Category(insertCategory);
    await category.save();
    return this.toPlainObject(category);
  }

  // Menu Items
  async getMenuItems(categoryId?: number): Promise<MenuItemType[]> {
    const query = categoryId ? { categoryId, isAvailable: true } : { isAvailable: true };
    const items = await MenuItem.find(query).populate('categoryId');
    return items.map(item => this.toPlainObject(item));
  }

  async getMenuItem(id: number): Promise<MenuItemType | undefined> {
    const item = await MenuItem.findById(id).populate('categoryId');
    return item ? this.toPlainObject(item) : undefined;
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItemType> {
    const item = new MenuItem(insertItem);
    await item.save();
    return this.toPlainObject(item);
  }

  async updateMenuItem(id: number, updates: Partial<MenuItemType>): Promise<MenuItemType | undefined> {
    const item = await MenuItem.findByIdAndUpdate(id, updates, { new: true });
    return item ? this.toPlainObject(item) : undefined;
  }

  // Orders
  async getOrders(userId?: number, status?: string): Promise<OrderType[]> {
    const query: any = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    
    const orders = await Order.find(query).populate('userId').sort({ createdAt: -1 });
    return orders.map(order => this.toPlainObject(order));
  }

  async getOrder(id: number): Promise<OrderType | undefined> {
    const order = await Order.findById(id).populate('userId');
    return order ? this.toPlainObject(order) : undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<OrderType> {
    const orderData = {
      ...insertOrder,
      orderNumber: `ORD${Date.now()}`,
    };
    
    const order = new Order(orderData);
    await order.save();
    return this.toPlainObject(order);
  }

  async updateOrder(id: number, updates: Partial<OrderType>): Promise<OrderType | undefined> {
    const order = await Order.findByIdAndUpdate(id, updates, { new: true });
    return order ? this.toPlainObject(order) : undefined;
  }

  // Reservations
  async getReservations(userId?: number): Promise<ReservationType[]> {
    const query = userId ? { userId } : {};
    const reservations = await Reservation.find(query).populate('userId').sort({ createdAt: -1 });
    return reservations.map(reservation => this.toPlainObject(reservation));
  }

  async getReservation(id: number): Promise<ReservationType | undefined> {
    const reservation = await Reservation.findById(id).populate('userId');
    return reservation ? this.toPlainObject(reservation) : undefined;
  }

  async createReservation(insertReservation: InsertReservation): Promise<ReservationType> {
    const reservationData = {
      ...insertReservation,
      confirmationCode: `RES${Date.now()}`,
    };
    
    const reservation = new Reservation(reservationData);
    await reservation.save();
    return this.toPlainObject(reservation);
  }

  async updateReservation(id: number, updates: Partial<ReservationType>): Promise<ReservationType | undefined> {
    const reservation = await Reservation.findByIdAndUpdate(id, updates, { new: true });
    return reservation ? this.toPlainObject(reservation) : undefined;
  }

  // Chats
  async getChats(userId?: number): Promise<ChatType[]> {
    let query = {};
    if (userId) {
      const participantChats = await ChatParticipant.find({ userId, isActive: true }).select('chatId');
      const chatIds = participantChats.map(p => p.chatId);
      query = { _id: { $in: chatIds }, isActive: true };
    } else {
      query = { isActive: true };
    }
    
    const chats = await Chat.find(query).populate('creatorId').sort({ lastMessageAt: -1 });
    return chats.map(chat => this.toPlainObject(chat));
  }

  async getChat(id: number): Promise<ChatType | undefined> {
    const chat = await Chat.findById(id).populate('creatorId');
    return chat ? this.toPlainObject(chat) : undefined;
  }

  async createChat(insertChat: InsertChat): Promise<ChatType> {
    const chatData = {
      ...insertChat,
      uuid: uuidv4(),
      messageCount: 0,
    };
    
    const chat = new Chat(chatData);
    await chat.save();
    return this.toPlainObject(chat);
  }

  async updateChat(id: number, updates: Partial<ChatType>): Promise<ChatType | undefined> {
    const chat = await Chat.findByIdAndUpdate(id, updates, { new: true });
    return chat ? this.toPlainObject(chat) : undefined;
  }

  async getChatsByUser(userId: number, limit = 50, offset = 0): Promise<ChatType[]> {
    const participantChats = await ChatParticipant.find({ userId, isActive: true })
      .select('chatId')
      .skip(offset)
      .limit(limit);
    
    const chatIds = participantChats.map(p => p.chatId);
    const chats = await Chat.find({ _id: { $in: chatIds }, isActive: true })
      .populate('creatorId')
      .sort({ lastMessageAt: -1 });
    
    return chats.map(chat => this.toPlainObject(chat));
  }

  // Chat Participants
  async getChatParticipants(chatId: number): Promise<ChatParticipantType[]> {
    const participants = await ChatParticipant.find({ chatId, isActive: true }).populate('userId');
    return participants.map(participant => this.toPlainObject(participant));
  }

  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipantType> {
    const chatParticipant = new ChatParticipant(participant);
    await chatParticipant.save();
    return this.toPlainObject(chatParticipant);
  }

  async removeChatParticipant(chatId: number, userId: number): Promise<void> {
    await ChatParticipant.findOneAndUpdate(
      { chatId, userId },
      { isActive: false, leftAt: new Date() }
    );
  }

  async updateChatParticipant(id: number, updates: Partial<ChatParticipantType>): Promise<ChatParticipantType | undefined> {
    const participant = await ChatParticipant.findByIdAndUpdate(id, updates, { new: true });
    return participant ? this.toPlainObject(participant) : undefined;
  }

  // Messages
  async getMessages(chatId: number, limit = 50, offset = 0): Promise<MessageType[]> {
    const messages = await Message.find({ chatId, isDeleted: false })
      .populate('senderId')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    return messages.reverse().map(message => this.toPlainObject(message));
  }

  async getMessage(id: number): Promise<MessageType | undefined> {
    const message = await Message.findById(id).populate('senderId');
    return message ? this.toPlainObject(message) : undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<MessageType> {
    const messageData = {
      ...insertMessage,
      uuid: uuidv4(),
    };
    
    const message = new Message(messageData);
    await message.save();
    
    // Update chat's last message info
    await Chat.findByIdAndUpdate(insertMessage.chatId, {
      lastMessageId: message._id,
      lastMessageAt: new Date(),
      $inc: { messageCount: 1 }
    });
    
    return this.toPlainObject(message);
  }

  async updateMessage(id: number, updates: Partial<MessageType>): Promise<MessageType | undefined> {
    const updateData = { ...updates };
    if (updates.content) {
      updateData.isEdited = true;
      updateData.editedAt = new Date();
    }
    
    const message = await Message.findByIdAndUpdate(id, updateData, { new: true });
    return message ? this.toPlainObject(message) : undefined;
  }

  async deleteMessage(id: number): Promise<void> {
    await Message.findByIdAndUpdate(id, { 
      isDeleted: true, 
      deletedAt: new Date() 
    });
  }

  async getMessagesByUser(userId: number, limit = 50, offset = 0): Promise<MessageType[]> {
    const messages = await Message.find({ senderId: userId, isDeleted: false })
      .populate('senderId')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    return messages.map(message => this.toPlainObject(message));
  }

  // Message Reactions
  async getMessageReactions(messageId: number): Promise<MessageReactionType[]> {
    const reactions = await MessageReaction.find({ messageId }).populate('userId');
    return reactions.map(reaction => this.toPlainObject(reaction));
  }

  async addMessageReaction(reaction: InsertMessageReaction): Promise<MessageReactionType> {
    const messageReaction = new MessageReaction(reaction);
    await messageReaction.save();
    return this.toPlainObject(messageReaction);
  }

  async removeMessageReaction(messageId: number, userId: number, emoji: string): Promise<void> {
    await MessageReaction.findOneAndDelete({ messageId, userId, emoji });
  }

  // Message Status
  async getMessageStatus(messageId: number): Promise<MessageStatusType[]> {
    const statuses = await MessageStatus.find({ messageId }).populate('userId');
    return statuses.map(status => this.toPlainObject(status));
  }

  async updateMessageStatus(messageId: number, userId: number, status: string): Promise<MessageStatusType> {
    const messageStatus = await MessageStatus.findOneAndUpdate(
      { messageId, userId },
      { status },
      { upsert: true, new: true }
    );
    return this.toPlainObject(messageStatus);
  }

  // User Connections
  async getUserConnections(userId: number): Promise<UserConnectionType[]> {
    const connections = await UserConnection.find({
      $or: [{ userId }, { connectedUserId: userId }],
      status: 'accepted'
    }).populate('userId connectedUserId');
    
    return connections.map(connection => this.toPlainObject(connection));
  }

  async createUserConnection(connection: InsertUserConnection): Promise<UserConnectionType> {
    const userConnection = new UserConnection(connection);
    await userConnection.save();
    return this.toPlainObject(userConnection);
  }

  async updateUserConnection(id: number, updates: Partial<UserConnectionType>): Promise<UserConnectionType | undefined> {
    const connection = await UserConnection.findByIdAndUpdate(id, updates, { new: true });
    return connection ? this.toPlainObject(connection) : undefined;
  }
}

export const mongoStorage = new MongoStorage();