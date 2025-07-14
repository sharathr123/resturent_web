import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, uuid, index, unique, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table optimized for large scale
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  email: text("email").notNull().unique(),
  username: text("username").unique(), // Add username for better UX
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("customer"),
  phone: text("phone"),
  avatar: text("avatar"),
  bio: text("bio"), // User bio for profiles
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen"),
  socketId: text("socket_id"), // For real-time tracking
  status: text("status").default("active"), // active, inactive, banned
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
  statusIdx: index("users_status_idx").on(table.status),
  onlineIdx: index("users_online_idx").on(table.isOnline),
}));

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu items table
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull(),
  ingredients: text("ingredients").array(),
  isVegetarian: boolean("is_vegetarian").default(false),
  isVegan: boolean("is_vegan").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  isSpicy: boolean("is_spicy").default(false),
  isAvailable: boolean("is_available").default(true),
  preparationTime: integer("preparation_time").default(15),
  nutrition: json("nutrition"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number"),
  userId: integer("user_id").notNull(),
  items: json("items").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  deliveryAddress: text("delivery_address"),
  customerInfo: json("customer_info"),
  notes: text("notes"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reservations table
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  customerInfo: json("customer_info").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guests: integer("guests").notNull(),
  table: integer("table"),
  status: text("status").notNull().default("pending"),
  specialRequests: text("special_requests"),
  occasion: text("occasion"),
  seatingPreference: text("seating_preference"),
  notes: text("notes"),
  confirmationCode: text("confirmation_code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Optimized chats table for large scale
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  name: text("name"),
  type: text("type").notNull().default("direct"), // direct, group, channel, support
  description: text("description"),
  image: text("image"), // Group/channel image
  creatorId: integer("creator_id").notNull(),
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(false), // For public channels
  maxParticipants: integer("max_participants").default(100),
  lastMessageId: bigint("last_message_id", { mode: "number" }),
  lastMessageAt: timestamp("last_message_at"),
  messageCount: integer("message_count").default(0),
  settings: json("settings"), // Chat-specific settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  typeIdx: index("chats_type_idx").on(table.type),
  activeIdx: index("chats_active_idx").on(table.isActive),
  publicIdx: index("chats_public_idx").on(table.isPublic),
  creatorIdx: index("chats_creator_idx").on(table.creatorId),
  lastMessageIdx: index("chats_last_message_idx").on(table.lastMessageAt),
}));

// Chat participants for many-to-many relationship
export const chatParticipants = pgTable("chat_participants", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("member"), // member, admin, moderator, owner
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadMessageId: bigint("last_read_message_id", { mode: "number" }),
  lastReadAt: timestamp("last_read_at"),
  unreadCount: integer("unread_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  isMuted: boolean("is_muted").default(false),
  mutedUntil: timestamp("muted_until"),
  notifications: boolean("notifications").default(true),
  leftAt: timestamp("left_at"), // For tracking when user left
  isActive: boolean("is_active").default(true),
}, (table) => ({
  chatUserIdx: index("chat_participants_chat_user_idx").on(table.chatId, table.userId),
  userIdx: index("chat_participants_user_idx").on(table.userId),
  chatIdx: index("chat_participants_chat_idx").on(table.chatId),
  activeIdx: index("chat_participants_active_idx").on(table.isActive),
  unreadIdx: index("chat_participants_unread_idx").on(table.unreadCount),
  chatUserUnique: unique("chat_participants_chat_user_unique").on(table.chatId, table.userId),
}));

// Messages table optimized for massive scale
export const messages = pgTable("messages", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  chatId: integer("chat_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content"),
  messageType: text("message_type").notNull().default("text"), // text, image, file, video, audio, system, deleted
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileMimeType: text("file_mime_type"),
  thumbnailUrl: text("thumbnail_url"), // For images/videos
  replyToId: bigint("reply_to_id", { mode: "number" }),
  forwardedFromId: bigint("forwarded_from_id", { mode: "number" }),
  editedAt: timestamp("edited_at"),
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  metadata: json("metadata"), // Additional message data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  chatIdx: index("messages_chat_idx").on(table.chatId),
  senderIdx: index("messages_sender_idx").on(table.senderId),
  chatCreatedIdx: index("messages_chat_created_idx").on(table.chatId, table.createdAt),
  typeIdx: index("messages_type_idx").on(table.messageType),
  deletedIdx: index("messages_deleted_idx").on(table.isDeleted),
  replyIdx: index("messages_reply_idx").on(table.replyToId),
}));

// Message reactions for scalability
export const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: bigint("message_id", { mode: "number" }).notNull(),
  userId: integer("user_id").notNull(),
  emoji: text("emoji").notNull(), // 👍, ❤️, 😂, etc.
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  messageUserEmojiIdx: unique("message_reactions_unique").on(table.messageId, table.userId, table.emoji),
  messageIdx: index("message_reactions_message_idx").on(table.messageId),
  userIdx: index("message_reactions_user_idx").on(table.userId),
}));

// Message status tracking for delivery and read receipts
export const messageStatus = pgTable("message_status", {
  id: serial("id").primaryKey(),
  messageId: bigint("message_id", { mode: "number" }).notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // delivered, read
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => ({
  messageUserIdx: unique("message_status_unique").on(table.messageId, table.userId),
  messageIdx: index("message_status_message_idx").on(table.messageId),
  userIdx: index("message_status_user_idx").on(table.userId),
  statusIdx: index("message_status_status_idx").on(table.status),
}));

// User connections for friend/contact system
export const userConnections = pgTable("user_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  connectedUserId: integer("connected_user_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userConnectedIdx: unique("user_connections_unique").on(table.userId, table.connectedUserId),
  userIdx: index("user_connections_user_idx").on(table.userId),
  connectedIdx: index("user_connections_connected_idx").on(table.connectedUserId),
  statusIdx: index("user_connections_status_idx").on(table.status),
}));

// Relations for better queries
export const usersRelations = relations(users, ({ many }) => ({
  sentMessages: many(messages),
  chatParticipants: many(chatParticipants),
  createdChats: many(chats),
  messageReactions: many(messageReactions),
  messageStatuses: many(messageStatus),
  connections: many(userConnections),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  creator: one(users, { fields: [chats.creatorId], references: [users.id] }),
  participants: many(chatParticipants),
  messages: many(messages),
  lastMessage: one(messages, { fields: [chats.lastMessageId], references: [messages.id] }),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  chat: one(chats, { fields: [chatParticipants.chatId], references: [chats.id] }),
  user: one(users, { fields: [chatParticipants.userId], references: [users.id] }),
  lastReadMessage: one(messages, { fields: [chatParticipants.lastReadMessageId], references: [messages.id] }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  chat: one(chats, { fields: [messages.chatId], references: [chats.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
  replyTo: one(messages, { fields: [messages.replyToId], references: [messages.id] }),
  forwardedFrom: one(messages, { fields: [messages.forwardedFromId], references: [messages.id] }),
  reactions: many(messageReactions),
  statuses: many(messageStatus),
}));

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(messages, { fields: [messageReactions.messageId], references: [messages.id] }),
  user: one(users, { fields: [messageReactions.userId], references: [users.id] }),
}));

export const messageStatusRelations = relations(messageStatus, ({ one }) => ({
  message: one(messages, { fields: [messageStatus.messageId], references: [messages.id] }),
  user: one(users, { fields: [messageStatus.userId], references: [users.id] }),
}));

export const userConnectionsRelations = relations(userConnections, ({ one }) => ({
  user: one(users, { fields: [userConnections.userId], references: [users.id] }),
  connectedUser: one(users, { fields: [userConnections.connectedUserId], references: [users.id] }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
  role: true,
  phone: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  description: true,
  image: true,
  order: true,
});

export const insertMenuItemSchema = createInsertSchema(menuItems).pick({
  name: true,
  description: true,
  image: true,
  price: true,
  categoryId: true,
  ingredients: true,
  isVegetarian: true,
  isVegan: true,
  isGlutenFree: true,
  isSpicy: true,
  preparationTime: true,
  nutrition: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  items: true,
  total: true,
  deliveryAddress: true,
  customerInfo: true,
  notes: true,
});

export const insertReservationSchema = createInsertSchema(reservations).pick({
  userId: true,
  customerInfo: true,
  date: true,
  time: true,
  guests: true,
  specialRequests: true,
  occasion: true,
  seatingPreference: true,
  notes: true,
});

export const insertChatSchema = createInsertSchema(chats).pick({
  name: true,
  type: true,
  description: true,
  image: true,
  creatorId: true,
  isPublic: true,
  maxParticipants: true,
  settings: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  senderId: true,
  content: true,
  messageType: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  fileMimeType: true,
  thumbnailUrl: true,
  replyToId: true,
  forwardedFromId: true,
  metadata: true,
});

export const insertChatParticipantSchema = createInsertSchema(chatParticipants).pick({
  chatId: true,
  userId: true,
  role: true,
});

export const insertMessageReactionSchema = createInsertSchema(messageReactions).pick({
  messageId: true,
  userId: true,
  emoji: true,
});

export const insertMessageStatusSchema = createInsertSchema(messageStatus).pick({
  messageId: true,
  userId: true,
  status: true,
});

export const insertUserConnectionSchema = createInsertSchema(userConnections).pick({
  userId: true,
  connectedUserId: true,
  status: true,
});

// Type exports for all tables
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservations.$inferSelect;

export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertChatParticipant = z.infer<typeof insertChatParticipantSchema>;
export type ChatParticipant = typeof chatParticipants.$inferSelect;

export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;
export type MessageReaction = typeof messageReactions.$inferSelect;

export type InsertMessageStatus = z.infer<typeof insertMessageStatusSchema>;
export type MessageStatus = typeof messageStatus.$inferSelect;

export type InsertUserConnection = z.infer<typeof insertUserConnectionSchema>;
export type UserConnection = typeof userConnections.$inferSelect;
