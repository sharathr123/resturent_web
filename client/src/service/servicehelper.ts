import type { AxiosRequestConfig } from "axios";
import { apiClient } from "./service";

export const httpGet = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const res = await apiClient.get<T>(url, config);
  return res.data;
};

export const httpPost = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const res = await apiClient.post<T>(url, data, config);
  return res.data;
};

export const httpPut = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const res = await apiClient.put<T>(url, data, config);
  return res.data;
};

export const httpDelete = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
};

// You can also type this with AxiosError if needed
export const handleApiError = (error: any): string => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Customize messages based on status
    switch (status) {
      case 400:
        return data.message || 'Bad request.';
      case 401:
        return data.message || 'Unauthorized access.';
      case 403:
        return data.message || 'Access denied.';
      case 404:
        return data.message || 'Resource not found.';
      case 500:
        return data.message || 'Internal server error.';
      default:
        return data.message || `Unexpected error: ${status}`;
    }
  } else if (error.request) {
    return 'No response from server. Please check your network.';
  } else {
    return error.message || 'An unknown error occurred.';
  }
};

