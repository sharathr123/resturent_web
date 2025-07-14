import { removeToken, removeUserDetails } from "../service/asyncstorage";
import {
  ApiResponse,
  User,
  MenuItem,
  Category,
  Order,
  Reservation,
  Chat,
  Message,
} from "../types";

class ApiClient {
  private baseUrl = "/api";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem("token")?.replace(/^"|"$/g, "");
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; data: User }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (response.success && response.data) {
      localStorage.setItem("token", response.data.token);
      return { success: true, data: response.data.data };
    }

    return { success: false, error: response.error };
  }

  async register(email: string, password: string, name: string) {
    const response = await this.request<{ token: string; data: User }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    if (response.success && response.data) {
      localStorage.setItem("token", response.data.token);
      return { success: true, data: response.data.data };
    }

    return { success: false, error: response.error };
  }

  async logout() {
    const response = await this.request<void>("/auth/logout", {
      method: "POST",
    });
    removeToken();
    removeUserDetails();
    return response;
  }

  async getMe() {
    return this.request<User>("/auth/me");
  }

  async updateProfile(data: Partial<User>) {
    return this.request<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Menu endpoints
  async getMenuItems(params?: {
    category?: string;
    search?: string;
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{ data: MenuItem[]; total: number; pagination: any }>
  > {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    return this.request<{ data: MenuItem[]; total: number; pagination: any }>(
      `/menu${queryString ? `?${queryString}` : ""}`
    );
  }

  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    return this.request<MenuItem>(`/menu/${id}`);
  }

  async getFeaturedItems(): Promise<ApiResponse<MenuItem[]>> {
    return this.request<MenuItem[]>("/menu/featured");
  }

  async getPopularItems(): Promise<ApiResponse<MenuItem[]>> {
    return this.request<MenuItem[]>("/menu/popular");
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>("/menu/categories");
  }

  // Orders endpoints
  async createOrder(order: {
    items: Array<{
      menuItem: string;
      quantity: number;
      specialInstructions?: string;
    }>;
    orderType: "delivery" | "pickup" | "dine-in";
    deliveryAddress?: any;
    customerNotes?: string;
    paymentMethod?: string;
  }): Promise<ApiResponse<Order>> {
    return this.request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ data: Order[]; total: number; pagination: any }>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    return this.request<{ data: Order[]; total: number; pagination: any }>(
      `/orders${queryString ? `?${queryString}` : ""}`
    );
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`);
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}/cancel`, {
      method: "PUT",
    });
  }

  // Chat endpoints
  async getChats(): Promise<ApiResponse<Chat[]>> {
    return this.request<Chat[]>("/chats");
  }

  async getChat(id: string): Promise<ApiResponse<Chat>> {
    return this.request<Chat>(`/chats/${id}`);
  }

  async createChat(data: {
    participants: string[];
    type: "direct" | "group";
    name?: string;
  }): Promise<ApiResponse<Chat>> {
    return this.request<Chat>("/chats", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async sendMessage(
    chatId: string,
    content: string
  ): Promise<ApiResponse<Message>> {
    return this.request<Message>(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async sendMessageWithFile(
    chatId: string,
    formData: FormData
  ): Promise<ApiResponse<Message>> {
    return this.request<Message>(`/chats/${chatId}/messages`, {
      method: "POST",
      body: formData,
    });
  }

  async togglePinChat(
    chatId: string
  ): Promise<ApiResponse<{ isPinned: boolean }>> {
    return this.request<{ isPinned: boolean }>(`/chats/${chatId}/pin`, {
      method: "PUT",
    });
  }

  async toggleMuteChat(
    chatId: string,
    duration: number
  ): Promise<ApiResponse<{ mutedUntil?: Date }>> {
    return this.request<{ mutedUntil?: Date }>(`/chats/${chatId}/mute`, {
      method: "PUT",
      body: JSON.stringify({ duration }),
    });
  }

  async getOnlineUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>("/chats/users/online");
  }

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(
      `/chats/users/search?q=${encodeURIComponent(query)}`
    );
  }

  // Reservation endpoints
  async createReservation(reservation: {
    date: string;
    time: string;
    guests: number;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    specialRequests?: string;
    occasion?: string;
    seatingPreference?: string;
  }): Promise<ApiResponse<Reservation>> {
    return this.request<Reservation>("/reservations", {
      method: "POST",
      body: JSON.stringify(reservation),
    });
  }

  async getReservations(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<
    ApiResponse<{ data: Reservation[]; total: number; pagination: any }>
  > {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    return this.request<{
      data: Reservation[];
      total: number;
      pagination: any;
    }>(`/reservations${queryString ? `?${queryString}` : ""}`);
  }

  async getReservation(id: string): Promise<ApiResponse<Reservation>> {
    return this.request<Reservation>(`/reservations/${id}`);
  }

  async cancelReservation(id: string): Promise<ApiResponse<Reservation>> {
    return this.request<Reservation>(`/reservations/${id}/cancel`, {
      method: "PUT",
    });
  }

  async getAvailableTimeSlots(
    date: string,
    guests?: number
  ): Promise<
    ApiResponse<{
      date: string;
      availableSlots: string[];
      totalSlots: number;
      availableCount: number;
    }>
  > {
    const queryParams = guests ? `?guests=${guests}` : "";
    return this.request<{
      date: string;
      availableSlots: string[];
      totalSlots: number;
      availableCount: number;
    }>(`/reservations/availability/${date}${queryParams}`);
  }

  // Admin endpoints
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    orderType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ data: Order[]; total: number; pagination: any }>> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    return this.request<{ data: Order[]; total: number; pagination: any }>(
      `/orders/admin/all${queryString ? `?${queryString}` : ""}`
    );
  }

  async updateOrderStatus(
    id: string,
    status: string,
    note?: string
  ): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, note }),
    });
  }

  async createMenuItem(
    item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<MenuItem>> {
    return this.request<MenuItem>("/menu", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async updateMenuItem(
    id: string,
    item: Partial<MenuItem>
  ): Promise<ApiResponse<MenuItem>> {
    return this.request<MenuItem>(`/menu/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  }

  async deleteMenuItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/menu/${id}`, {
      method: "DELETE",
    });
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.request<any>("/admin/analytics");
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>("/admin/users");
  }

  async updateUser(
    id: string,
    user: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.request<User>(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admin/users/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
