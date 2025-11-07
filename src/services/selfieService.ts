import axios, { type AxiosInstance, AxiosError } from "axios";

// Selfie API Configuration
const SELFIE_API_BASE_URL = import.meta.env.VITE_SELFIE_API_BASE_URL;

// Create separate axios instance for Selfie API
const selfieApiClient: AxiosInstance = axios.create({
  baseURL: SELFIE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
selfieApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
selfieApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Unauthorized or Forbidden - clear token and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("user_permissions");
      localStorage.removeItem("user_roles");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Selfie API Response Types
export interface SelfieVerificationResponse {
  bvn: string;
  confidence: number;
  similarity: number;
}

export interface SelfieRecord {
  id: number;
  userId: string;
  bvn: string;
  image: string;
  response: SelfieVerificationResponse;
  createdAt: string;
  updatedAt: string;
}

export interface SelfieMetadata {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

export interface SelfiesResponse {
  data: {
    items: SelfieRecord[];
    meta: SelfieMetadata;
  };
  message: string;
}

export interface SelfieQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  bvn?: string;
}

// Selfie Service
export const selfieService = {
  /**
   * Get all selfie verification records with pagination and optional search
   */
  getAllRecords: async (
    params?: SelfieQueryParams
  ): Promise<SelfiesResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) {
        queryParams.append("page", params.page.toString());
      }
      if (params?.limit) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params?.userId) {
        queryParams.append("userId", params.userId);
      }
      if (params?.bvn) {
        queryParams.append("bvn", params.bvn);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `/admin/get-selfies?${queryString}`
        : "/admin/get-selfies";

      const response = await selfieApiClient
        .get<SelfiesResponse>(url)
        .then((res) => res.data);

      return response;
    } catch (error: unknown) {
      console.error("Selfie fetch error:", error);

      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        const data = axiosError.response.data as { message?: string };
        if (data.message) {
          throw new Error(data.message);
        }
      }
      if (axiosError.message) {
        throw new Error(axiosError.message);
      }
      throw new Error("Failed to fetch selfie records");
    }
  },

  /**
   * Get selfie records with pagination
   */
  getRecordsPaginated: async (
    page: number = 1,
    limit: number = 10
  ): Promise<SelfiesResponse> => {
    return selfieService.getAllRecords({ page, limit });
  },
};
