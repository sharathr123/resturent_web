import { 
  users, categories, menuItems, orders, reservations, chats, messages, chatParticipants, messageReactions, messageStatus, userConnections,
  type User, type InsertUser, type Category, type InsertCategory, type MenuItem, type InsertMenuItem, 
  type Order, type InsertOrder, type Reservation, type InsertReservation, type Chat, type InsertChat, 
  type Message, type InsertMessage, type ChatParticipant, type InsertChatParticipant,
  type MessageReaction, type InsertMessageReaction, type MessageStatus, type InsertMessageStatus,
  type UserConnection, type InsertUserConnection
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, asc, isNull, not, inArray, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserSocketId(id: number, socketId: string | null): Promise<void>;
  setUserOnlineStatus(id: number, isOnline: boolean): Promise<void>;
  getOnlineUsers(): Promise<User[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Menu Items
  getMenuItems(categoryId?: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem | undefined>;
  
  // Orders
  getOrders(userId?: number, status?: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined>;
  
  // Reservations
  getReservations(userId?: number): Promise<Reservation[]>;
  getReservation(id: number): Promise<Reservation | undefined>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, updates: Partial<Reservation>): Promise<Reservation | undefined>;
  
  // Chats - Enhanced for large scale
  getChats(userId?: number): Promise<Chat[]>;
  getChat(id: number): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  updateChat(id: number, updates: Partial<Chat>): Promise<Chat | undefined>;
  getChatsByUser(userId: number, limit?: number, offset?: number): Promise<Chat[]>;
  
  // Chat Participants
  getChatParticipants(chatId: number): Promise<ChatParticipant[]>;
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  removeChatParticipant(chatId: number, userId: number): Promise<void>;
  updateChatParticipant(id: number, updates: Partial<ChatParticipant>): Promise<ChatParticipant | undefined>;
  
  // Messages - Optimized for large scale
  getMessages(chatId: number, limit?: number, offset?: number): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, updates: Partial<Message>): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<void>;
  getMessagesByUser(userId: number, limit?: number, offset?: number): Promise<Message[]>;
  
  // Message Reactions
  getMessageReactions(messageId: number): Promise<MessageReaction[]>;
  addMessageReaction(reaction: InsertMessageReaction): Promise<MessageReaction>;
  removeMessageReaction(messageId: number, userId: number, emoji: string): Promise<void>;
  
  // Message Status
  getMessageStatus(messageId: number): Promise<MessageStatus[]>;
  updateMessageStatus(messageId: number, userId: number, status: string): Promise<MessageStatus>;
  
  // User Connections
  getUserConnections(userId: number): Promise<UserConnection[]>;
  createUserConnection(connection: InsertUserConnection): Promise<UserConnection>;
  updateUserConnection(id: number, updates: Partial<UserConnection>): Promise<UserConnection | undefined>;
}

export class DatabaseStorage implements IStorage {
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async updateUserSocketId(id: number, socketId: string | null): Promise<void> {
    await db.update(users).set({ socketId }).where(eq(users.id, id));
  }

  async setUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    await db.update(users).set({ 
      isOnline, 
      lastSeen: isOnline ? null : new Date() 
    }).where(eq(users.id, id));
  }

  async getOnlineUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isOnline, true));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.order));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  // Menu Items
  async getMenuItems(categoryId?: number): Promise<MenuItem[]> {
    let query = db.select().from(menuItems).where(eq(menuItems.isAvailable, true));
    
    if (categoryId) {
      query = query.where(eq(menuItems.categoryId, categoryId));
    }
    
    return await query.orderBy(asc(menuItems.name));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item || undefined;
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const [item] = await db.insert(menuItems).values(insertItem).returning();
    return item;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const [item] = await db.update(menuItems).set(updates).where(eq(menuItems.id, id)).returning();
    return item || undefined;
  }

  // Orders
  async getOrders(userId?: number, status?: string): Promise<Order[]> {
    let query = db.select().from(orders);
    
    if (userId) {
      query = query.where(eq(orders.userId, userId));
    }
    
    if (status) {
      query = query.where(eq(orders.status, status));
    }
    
    return await query.orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const [order] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return order || undefined;
  }

  // Reservations
  async getReservations(userId?: number): Promise<Reservation[]> {
    let query = db.select().from(reservations);
    
    if (userId) {
      query = query.where(eq(reservations.userId, userId));
    }
    
    return await query.orderBy(desc(reservations.createdAt));
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation || undefined;
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const [reservation] = await db.insert(reservations).values(insertReservation).returning();
    return reservation;
  }

  async updateReservation(id: number, updates: Partial<Reservation>): Promise<Reservation | undefined> {
    const [reservation] = await db.update(reservations).set(updates).where(eq(reservations.id, id)).returning();
    return reservation || undefined;
  }

  // Chats - Enhanced for large scale
  async getChats(userId?: number): Promise<Chat[]> {
    if (userId) {
      return await db
        .select()
        .from(chats)
        .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
        .where(and(
          eq(chatParticipants.userId, userId),
          eq(chatParticipants.isActive, true),
          eq(chats.isActive, true)
        ))
        .orderBy(desc(chats.lastMessageAt));
    }
    
    return await db.select().from(chats).where(eq(chats.isActive, true)).orderBy(desc(chats.lastMessageAt));
  }

  async getChat(id: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat || undefined;
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values(insertChat).returning();
    return chat;
  }

  async updateChat(id: number, updates: Partial<Chat>): Promise<Chat | undefined> {
    const [chat] = await db.update(chats).set(updates).where(eq(chats.id, id)).returning();
    return chat || undefined;
  }

  async getChatsByUser(userId: number, limit = 50, offset = 0): Promise<Chat[]> {
    return await db
      .select()
      .from(chats)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .where(and(
        eq(chatParticipants.userId, userId),
        eq(chatParticipants.isActive, true),
        eq(chats.isActive, true)
      ))
      .orderBy(desc(chats.lastMessageAt))
      .limit(limit)
      .offset(offset);
  }

  // Chat Participants
  async getChatParticipants(chatId: number): Promise<ChatParticipant[]> {
    return await db
      .select()
      .from(chatParticipants)
      .where(and(eq(chatParticipants.chatId, chatId), eq(chatParticipants.isActive, true)));
  }

  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    const [chatParticipant] = await db.insert(chatParticipants).values(participant).returning();
    return chatParticipant;
  }

  async removeChatParticipant(chatId: number, userId: number): Promise<void> {
    await db
      .update(chatParticipants)
      .set({ isActive: false, leftAt: new Date() })
      .where(and(eq(chatParticipants.chatId, chatId), eq(chatParticipants.userId, userId)));
  }

  async updateChatParticipant(id: number, updates: Partial<ChatParticipant>): Promise<ChatParticipant | undefined> {
    const [participant] = await db.update(chatParticipants).set(updates).where(eq(chatParticipants.id, id)).returning();
    return participant || undefined;
  }

  // Messages - Optimized for large scale
  async getMessages(chatId: number, limit = 50, offset = 0): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(and(eq(messages.chatId, chatId), eq(messages.isDeleted, false)))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    
    // Update chat last message info
    await db.update(chats).set({
      lastMessageId: message.id,
      lastMessageAt: message.createdAt,
      messageCount: db.raw('message_count + 1')
    }).where(eq(chats.id, message.chatId));
    
    return message;
  }

  async updateMessage(id: number, updates: Partial<Message>): Promise<Message | undefined> {
    const [message] = await db.update(messages).set(updates).where(eq(messages.id, id)).returning();
    return message || undefined;
  }

  async deleteMessage(id: number): Promise<void> {
    await db.update(messages).set({ 
      isDeleted: true, 
      deletedAt: new Date(),
      content: null 
    }).where(eq(messages.id, id));
  }

  async getMessagesByUser(userId: number, limit = 50, offset = 0): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(and(eq(messages.senderId, userId), eq(messages.isDeleted, false)))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Message Reactions
  async getMessageReactions(messageId: number): Promise<MessageReaction[]> {
    return await db.select().from(messageReactions).where(eq(messageReactions.messageId, messageId));
  }

  async addMessageReaction(reaction: InsertMessageReaction): Promise<MessageReaction> {
    const [messageReaction] = await db.insert(messageReactions).values(reaction).returning();
    return messageReaction;
  }

  async removeMessageReaction(messageId: number, userId: number, emoji: string): Promise<void> {
    await db.delete(messageReactions).where(
      and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.userId, userId),
        eq(messageReactions.emoji, emoji)
      )
    );
  }

  // Message Status
  async getMessageStatus(messageId: number): Promise<MessageStatus[]> {
    return await db.select().from(messageStatus).where(eq(messageStatus.messageId, messageId));
  }

  async updateMessageStatus(messageId: number, userId: number, status: string): Promise<MessageStatus> {
    const [existing] = await db.select().from(messageStatus).where(
      and(eq(messageStatus.messageId, messageId), eq(messageStatus.userId, userId))
    );
    
    if (existing) {
      const [updated] = await db.update(messageStatus).set({ status, timestamp: new Date() })
        .where(eq(messageStatus.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(messageStatus).values({
        messageId,
        userId,
        status
      }).returning();
      return created;
    }
  }

  // User Connections
  async getUserConnections(userId: number): Promise<UserConnection[]> {
    return await db.select().from(userConnections).where(eq(userConnections.userId, userId));
  }

  async createUserConnection(connection: InsertUserConnection): Promise<UserConnection> {
    const [userConnection] = await db.insert(userConnections).values(connection).returning();
    return userConnection;
  }

  async updateUserConnection(id: number, updates: Partial<UserConnection>): Promise<UserConnection | undefined> {
    const [connection] = await db.update(userConnections).set(updates).where(eq(userConnections.id, id)).returning();
    return connection || undefined;
  }
}

export const storage = new DatabaseStorage();