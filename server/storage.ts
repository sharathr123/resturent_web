import { 
  users, 
  categories, 
  menuItems, 
  orders, 
  reservations, 
  chats, 
  messages,
  type User, 
  type InsertUser,
  type Category,
  type InsertCategory,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type Reservation,
  type InsertReservation,
  type Chat,
  type InsertChat,
  type Message,
  type InsertMessage
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
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
  
  // Chats
  getChats(userId?: number): Promise<Chat[]>;
  getChat(id: number): Promise<Chat | undefined>;
  createChat(chat: InsertChat): Promise<Chat>;
  
  // Messages
  getMessages(chatId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private menuItems: Map<number, MenuItem>;
  private orders: Map<number, Order>;
  private reservations: Map<number, Reservation>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.menuItems = new Map();
    this.orders = new Map();
    this.reservations = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.currentId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample categories
    const sampleCategories = [
      { name: "Appetizers", description: "Start your meal right", image: "/images/appetizers.jpg", order: 1 },
      { name: "Main Courses", description: "Our signature dishes", image: "/images/mains.jpg", order: 2 },
      { name: "Desserts", description: "Sweet endings", image: "/images/desserts.jpg", order: 3 },
      { name: "Beverages", description: "Drinks and refreshments", image: "/images/beverages.jpg", order: 4 }
    ];
    
    sampleCategories.forEach(cat => {
      const category: Category = {
        id: this.currentId++,
        ...cat,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.categories.set(category.id, category);
    });
    
    // Sample menu items
    const sampleMenuItems = [
      {
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with parmesan and croutons",
        image: "/images/caesar-salad.jpg",
        price: "12.99",
        categoryId: 1,
        ingredients: ["romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
        isVegetarian: true,
        preparationTime: 10,
        nutrition: { calories: 350, protein: 8, carbs: 15, fat: 30 }
      },
      {
        name: "Grilled Chicken",
        description: "Perfectly seasoned grilled chicken breast",
        image: "/images/grilled-chicken.jpg",
        price: "18.99",
        categoryId: 2,
        ingredients: ["chicken breast", "herbs", "olive oil", "lemon"],
        isVegetarian: false,
        preparationTime: 25,
        nutrition: { calories: 450, protein: 35, carbs: 5, fat: 20 }
      },
      {
        name: "Chocolate Cake",
        description: "Rich chocolate cake with vanilla frosting",
        image: "/images/chocolate-cake.jpg",
        price: "8.99",
        categoryId: 3,
        ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla"],
        isVegetarian: true,
        preparationTime: 5,
        nutrition: { calories: 520, protein: 6, carbs: 65, fat: 25 }
      }
    ];
    
    sampleMenuItems.forEach(item => {
      const menuItem: MenuItem = {
        id: this.currentId++,
        ...item,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.menuItems.set(menuItem.id, menuItem);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      isOnline: false,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.isActive);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentId++;
    const category: Category = {
      ...insertCategory,
      id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.categories.set(id, category);
    return category;
  }

  // Menu Items
  async getMenuItems(categoryId?: number): Promise<MenuItem[]> {
    const items = Array.from(this.menuItems.values()).filter(item => item.isAvailable);
    if (categoryId) {
      return items.filter(item => item.categoryId === categoryId);
    }
    return items;
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentId++;
    const menuItem: MenuItem = {
      ...insertItem,
      id,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const item = this.menuItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...updates, updatedAt: new Date() };
    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  // Orders
  async getOrders(userId?: number, status?: string): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }
    if (status) {
      orders = orders.filter(order => order.status === status);
    }
    return orders;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentId++;
    const order: Order = {
      ...insertOrder,
      id,
      orderNumber: `ORD-${id.toString().padStart(4, '0')}`,
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Reservations
  async getReservations(userId?: number): Promise<Reservation[]> {
    const reservations = Array.from(this.reservations.values());
    if (userId) {
      return reservations.filter(reservation => reservation.userId === userId);
    }
    return reservations;
  }

  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = this.currentId++;
    const reservation: Reservation = {
      ...insertReservation,
      id,
      status: "pending",
      confirmationCode: `RES-${id.toString().padStart(4, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.reservations.set(id, reservation);
    return reservation;
  }

  async updateReservation(id: number, updates: Partial<Reservation>): Promise<Reservation | undefined> {
    const reservation = this.reservations.get(id);
    if (!reservation) return undefined;
    
    const updatedReservation = { ...reservation, ...updates, updatedAt: new Date() };
    this.reservations.set(id, updatedReservation);
    return updatedReservation;
  }

  // Chats
  async getChats(userId?: number): Promise<Chat[]> {
    const chats = Array.from(this.chats.values()).filter(chat => chat.isActive);
    if (userId) {
      return chats.filter(chat => chat.participants?.includes(userId.toString()));
    }
    return chats;
  }

  async getChat(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.currentId++;
    const chat: Chat = {
      ...insertChat,
      id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.chats.set(id, chat);
    return chat;
  }

  // Messages
  async getMessages(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(message => message.chatId === chatId);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const message: Message = {
      ...insertMessage,
      id,
      status: "sent",
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }
}

// Import the new database storage
import { storage as databaseStorage } from './database-storage';

export const storage = databaseStorage;
