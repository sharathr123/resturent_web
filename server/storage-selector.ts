import { IStorage } from "./storage";
import { MemStorage } from "./storage";

// Initialize with in-memory storage by default
let currentStorage: IStorage = new MemStorage();

// Function to switch to MongoDB storage when available
export const initializeStorage = async (): Promise<IStorage> => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (mongoUri) {
    try {
      // Dynamic import to avoid loading MongoDB dependencies if not needed
      const { connectMongoDB } = await import("./mongodb");
      const { mongoStorage } = await import("./mongodb-storage");
      
      const connected = await connectMongoDB();
      if (connected) {
        console.log('✅ MongoDB connected successfully - using MongoDB storage');
        currentStorage = mongoStorage;
        return currentStorage;
      }
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      console.log('📦 Falling back to in-memory storage');
    }
  } else {
    console.log('📦 No MONGODB_URI found - using in-memory storage');
  }
  
  return currentStorage;
};

// Export the storage instance
export const getStorage = (): IStorage => currentStorage;

// For backward compatibility
export const storage = currentStorage;