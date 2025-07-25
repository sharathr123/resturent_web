import { io, Socket } from "socket.io-client";
import { Message, Chat } from "../types";

class SocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io("http://localhost:5002", {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to socket server");
      this.reconnectAttempts = 0;
      this.emitToListeners("connected", true);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from socket server:", reason);
      this.emitToListeners("connected", false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        this.emitToListeners("connectionFailed", true);
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(
        "Reconnected to socket server after",
        attemptNumber,
        "attempts"
      );
      this.reconnectAttempts = 0;
      this.emitToListeners("reconnected", true);
    });

    // Chat event listeners
    this.socket.on("newMessage", (data) => {
      this.emitToListeners("newMessage", data);
    });

    this.socket.on("newChat", (data) => {
      this.emitToListeners("newChat", data);
    });

    this.socket.on("userTyping", (data) => {
      this.emitToListeners("userTyping", data);
    });

    this.socket.on("messageStatusUpdate", (data) => {
      this.emitToListeners("messageStatusUpdate", data);
    });

    this.socket.on("messagesRead", (data) => {
      this.emitToListeners("messagesRead", data);
    });

    this.socket.on("userStatusChange", (data) => {
      this.emitToListeners("userStatusChange", data);
    });

    this.socket.on("chatUpdated", (data) => {
      this.emitToListeners("chatUpdated", data);
    });

    this.socket.on("orderUpdate", (data) => {
      this.emitToListeners("orderUpdate", data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  // Chat methods
  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  // Chat-specific methods
  enterChat(chatId: string) {
    this.emit("enterChat", chatId);
  }

  leaveChat(chatId: string) {
    this.emit("leaveChat", chatId);
  }

  sendTyping(chatId: string, isTyping: boolean) {
    this.emit("typing", { chatId, isTyping });
  }

  sendMessage(data: {
    chatId: string;
    content: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) {
    // console.log('sending message', data);
    this.emit("sendMessage", data);
  }
  // Message status methods
  markMessageDelivered(messageId: string, chatId: string) {
    this.emit("messageDelivered", { messageId, chatId });
  }

  markMessageSeen(messageId: string, chatId: string) {
    this.emit("messageSeen", { messageId, chatId });
  }

  // Order tracking
  trackOrder(orderId: string) {
    this.socket?.emit("trackOrder", orderId);
  }

  stopTrackingOrder(orderId: string) {
    this.socket?.emit("stopTrackingOrder", orderId);
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Private method to emit to local listeners
  private emitToListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  // Connection status
  get isConnected() {
    return this.socket?.connected || false;
  }

  // Force reconnection
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }
}

export const socket = new SocketManager();
