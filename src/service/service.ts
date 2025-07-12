import axios from 'axios';
import {
    getToken,
} from './asyncstorage';
/** Axios instance */
export const apiClient = axios.create({
    timeout: 15000,
});

/** Request interceptor */
apiClient.interceptors.request.use(async (config) => {
  const token = getToken();

  config.headers['Content-Type'] = 'application/json';

  if (token) config.headers['Authorization'] = `Bearer ${token}`;

  return config;
}, (error) => Promise.reject(error));

export const registerUser = async (url: string, payload: any) => {
    const response = await axios.post(url, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data.data;
};

export const loginUser = async (url: string, payload: any) => {
    const response = await axios.post(url, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const uploadFile = async (url: string, formData: FormData, companyId?: string) => {
    const headers: any = {
        'Content-Type': 'multipart/form-data',
    };

    if (companyId) {
        headers['Company-ID'] = companyId;
    }

    const response = await apiClient.post(url, formData, { headers });
    return response.data;
};