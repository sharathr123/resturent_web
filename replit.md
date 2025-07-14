# Restaurant Management System

## Overview

This is a full-stack large-scale chat application built with Node.js/Express backend and React/TypeScript frontend, originally migrated from a restaurant management system. The application is designed to handle 1M+ users with PostgreSQL database optimization, real-time messaging, user connections, and comprehensive chat features. It uses a monorepo structure with shared TypeScript schemas and modern web technologies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS styling
- **State Management**: React Context API for authentication and cart management
- **Routing**: React Router v6
- **Animations**: Framer Motion for smooth transitions and interactions
- **HTTP Client**: Fetch API with custom wrapper
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Communication**: Socket.IO client

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM (auto-fallback to in-memory storage)
- **Database Provider**: MongoDB Atlas or local MongoDB instance
- **Storage Strategy**: Dynamic storage selector (MongoDB → in-memory fallback)
- **Authentication**: JWT-based authentication with session management
- **Real-time Features**: Socket.IO for chat and live updates
- **API Design**: RESTful endpoints with `/api` prefix
- **Development**: Hot reloading with Vite integration

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: ESBuild for production bundling
- **Development**: Concurrent development with TSX for backend hot reloading
- **Styling**: Tailwind CSS with PostCSS processing
- **TypeScript**: Shared configuration across client, server, and shared modules

## Key Components

### Authentication System
- JWT token-based authentication
- Context-based user state management
- Protected routes and role-based access
- Local storage for token persistence
- Socket.IO authentication integration

### Shopping Cart
- Context-based cart state management
- Local storage persistence
- Real-time cart updates
- Floating cart component for quick access

### Real-time Chat
- Socket.IO implementation for live messaging
- Chat sidebar with conversation list
- Message status indicators (read/unread)
- Typing indicators and online status
- File upload support for images

### Database Schema
- User management with roles (customer, admin, staff)
- Menu categories and items with rich metadata
- Orders with status tracking and items
- Reservations with date/time management
- Chat messages with user relationships

### UI Components
- Reusable component library with consistent styling
- Animation components using Framer Motion
- Form components with validation
- Modal, notification, and toast systems
- Responsive design with mobile-first approach

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Backend validates and returns JWT token
3. Token stored in localStorage and context
4. Socket.IO connection established with token
5. Protected routes check authentication status

### Order Processing
1. User browses menu and adds items to cart
2. Cart state managed in React Context
3. Checkout process creates order via API
4. Order status updates via Socket.IO
5. Real-time notifications for order updates

### Real-time Communication
1. Socket.IO connection on user authentication
2. Chat messages broadcast to relevant users
3. Typing indicators and online status updates
4. Order status notifications to customers
5. Admin notifications for new orders/reservations

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation
- **Animations**: Framer Motion for smooth animations
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: JWT for token-based auth
- **Real-time**: Socket.IO for WebSocket communication
- **Session Storage**: connect-pg-simple for PostgreSQL sessions
- **Validation**: Zod for schema validation
- **Environment**: dotenv for configuration

### Development Dependencies
- **Build Tools**: Vite for frontend, ESBuild for backend
- **TypeScript**: Shared configuration across all modules
- **Dev Tools**: Replit-specific plugins for development experience

## Deployment Strategy

### Development Environment
- Replit-hosted development with live reloading
- Vite dev server for frontend with HMR
- TSX for backend hot reloading
- PostgreSQL database via Neon serverless

### Production Build
- Frontend: Vite build to `dist/public`
- Backend: ESBuild bundle to `dist/index.js`
- Static file serving from Express
- Database migrations via Drizzle Kit

### Environment Configuration
- Environment variables for database connection
- JWT secret configuration
- Production/development mode switching
- Replit-specific optimizations

### Key Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Socket.IO for live chat and order tracking
- **Authentication**: Secure JWT-based user authentication
- **Cart Management**: Persistent shopping cart with local storage
- **Form Validation**: Zod schemas for type-safe validation
- **Error Handling**: Comprehensive error boundaries and API error handling
- **Accessibility**: Radix UI components ensure WCAG compliance
- **Performance**: Lazy loading, code splitting, and optimized builds

The application follows modern web development best practices with TypeScript for type safety, component-driven architecture, and real-time features for enhanced user experience.

### MongoDB Migration & Storage Strategy

#### Current Implementation
- **Dynamic Storage Selector**: Automatically chooses MongoDB or in-memory storage based on configuration
- **Graceful Fallback**: Falls back to in-memory storage if MongoDB connection fails
- **Production Ready**: MongoDB implementation with optimized schemas and indexes for 1M+ users
- **Development Friendly**: Works immediately without external dependencies

#### MongoDB Setup
To enable MongoDB storage:
1. Set `MONGODB_URI` environment variable in Replit Secrets
2. Server automatically detects and connects to MongoDB
3. Uses optimized schemas with compound indexes for chat scalability
4. Supports both MongoDB Atlas and local MongoDB instances

#### Storage Features
- **Chat Optimization**: Efficient message retrieval with pagination and indexing
- **User Management**: Comprehensive user profiles with online status tracking
- **Real-time Support**: Socket.IO integration for live chat features
- **Scalability**: Designed for 1M+ users with proper indexing strategy

#### Files Structure
- `server/storage-selector.ts`: Dynamic storage selection logic
- `server/mongodb.ts`: MongoDB connection and schemas
- `server/mongodb-storage.ts`: MongoDB implementation of storage interface
- `server/storage.ts`: In-memory storage fallback
- `MONGODB_SETUP.md`: Detailed setup and configuration guide