import axios, { AxiosError, AxiosResponse } from "axios";
import { Campaign, LinkedInProfile, MessageResponse } from "../types";

const API_BASE_URL = "https://campaign-backend1.vercel.app/api";
// const API_BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || "An error occurred";
      const errorDetails = error.response.data?.details;
      return Promise.reject({
        message: errorMessage,
        status: error.response.status,
        data: errorDetails,
      });
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({
        message: "No response received from server",
        status: 500,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject({
        message: error.message,
        status: 500,
      });
    }
  }
);

export const campaignApi = {
  getAll: () => api.get<Campaign[]>("/campaigns"),
  getById: (id: string) => api.get<Campaign>(`/campaigns/${id}`),
  create: (data: Omit<Campaign, "_id" | "createdAt" | "updatedAt">) =>
    api.post<Campaign>("/campaigns", data),
  update: (id: string, data: Partial<Campaign>) =>
    api.put<Campaign>(`/campaigns/${id}`, data),
  delete: (id: string) => api.delete(`/campaigns/${id}`),
  getAccounts: () => api.get<{ _id: string; name: string }[]>("/accounts"),
};

export const messageApi = {
  generate: (data: {
    name: string;
    job_title: string;
    company: string;
    location: string;
    summary?: string;
  }) => api.post<{ message: string }>("/personalized-message", data),
};

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error("API Error:", error.response.data);
    return error.response.data.message || "An error occurred";
  } else if (error.request) {
    // The request was made but no response was received
    console.error("Network Error:", error.request);
    return "Network error. Please check your connection.";
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Error:", error.message);
    return error.message || "An unexpected error occurred";
  }
};
