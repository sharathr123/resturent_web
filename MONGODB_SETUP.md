# MongoDB Setup Guide for Large-Scale Chat Application

## Overview
This guide helps you set up MongoDB for the large-scale chat application that's designed to handle 1M+ users with optimized performance, indexing, and scalability.

## Quick Setup Options

### Option 1: MongoDB Atlas (Recommended for Production)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Set the `MONGODB_URI` environment variable in Replit Secrets

### Option 2: Local MongoDB (Development)
1. Install MongoDB locally
2. Run `mongod` to start the service
3. Use default connection: `mongodb://localhost:27017/chat-app`

## Environment Variables

Add these to your Replit Secrets:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app?retryWrites=true&w=majority
```

## Database Schema

The application uses the following MongoDB collections:

### Users Collection
- Stores user profiles, authentication, and online status
- Indexes: email (unique), username (unique), isOnline, lastSeen

### Chats Collection
- Stores chat room/conversation metadata
- Indexes: creatorId, isActive, lastMessageAt

### Messages Collection
- Stores all chat messages with optimized retrieval
- Indexes: chatId + createdAt (compound), senderId + createdAt, isDeleted

### Chat Participants Collection
- Manages user membership in chats
- Indexes: chatId + userId (compound), userId + isActive

### Additional Collections
- Categories, Menu Items, Orders, Reservations (restaurant features)
- Message Reactions, Message Status, User Connections

## Performance Optimizations

### Indexing Strategy
- Compound indexes for common query patterns
- Text indexes for search functionality
- Sparse indexes for optional fields

### Scalability Features
- Pagination support for large datasets
- Optimized queries for 1M+ users
- Efficient message retrieval with limits and offsets

## Migration from In-Memory Storage

To switch from in-memory to MongoDB:

1. Set up MongoDB (Atlas or local)
2. Add `MONGODB_URI` to environment variables
3. Update `server/storage.ts`:
   ```typescript
   import { mongoStorage } from "./mongodb-storage";
   export const storage = mongoStorage;
   ```
4. Uncomment MongoDB connection in `server/index.ts`

## Testing MongoDB Integration

Use these curl commands to test:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'

# Create a chat (with auth token)
curl -X POST http://localhost:5000/api/chats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Test Chat", "type": "group"}'

# Send a message
curl -X POST http://localhost:5000/api/chats/CHAT_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content": "Hello, world!", "messageType": "text"}'
```

## Troubleshooting

### Common Issues
1. **Connection Timeout**: Check network connectivity and firewall settings
2. **Authentication Error**: Verify username/password in connection string
3. **Database Access**: Ensure IP whitelist includes your location

### Debug Mode
Enable MongoDB debug logging:
```javascript
mongoose.set('debug', true);
```

## Production Considerations

### Security
- Use strong authentication credentials
- Enable IP whitelist in MongoDB Atlas
- Use environment variables for sensitive data

### Performance
- Enable connection pooling
- Use appropriate read preferences
- Monitor query performance

### Monitoring
- Set up MongoDB monitoring in Atlas
- Track key metrics: connections, operations, storage
- Set up alerts for performance issues

## Support

For issues with MongoDB setup:
1. Check MongoDB Atlas documentation
2. Review connection string format
3. Verify environment variable configuration
4. Test connection with MongoDB Compass

The application is designed to gracefully handle MongoDB connection issues by falling back to in-memory storage during development.