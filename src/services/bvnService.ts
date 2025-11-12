import axios, { type AxiosInstance, AxiosError } from "axios";

// BVN API Configuration
const BVN_API_BASE_URL =
  import.meta.env.VITE_BVN_API_BASE_URL || "http://172.16.0.18:7010/api";

// Create separate axios instance for BVN API
const bvnApiClient: AxiosInstance = axios.create({
  baseURL: BVN_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
bvnApiClient.interceptors.request.use(
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
bvnApiClient.interceptors.response.use(
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

// BVN API Response Types (matching the actual backend response)
export interface BVNRecord {
  bvn: string;
  phoneNumber: string;
  name: string;
  gender: string;
  email: string;
  maritalStatus: string;
  createdAt?: string;
  updatedAt?: string;
  registrationDate?: string;
}

export interface BVNDetailRecord {
  _id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  phoneNumber1: string;
  phoneNumber2: string;
  gender: string;
  stateOfOrigin: string;
  bvn: string;
  nin: string | null;
  lgaOfOrigin: string;
  lgaOfResidence: string;
  maritalStatus: string;
  watchlisted: boolean;
  registrationDate: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BVNRecordsResponse {
  message: string;
  status: boolean;
  data: BVNRecord[];
  meta: {
    currentPage: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BVNDetailResponse {
  message: string;
  status: boolean;
  data: BVNDetailRecord;
}

export interface BVNQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  bvn?: string;
}

// BVN Service
export const bvnService = {
  /**
   * Get all BVN records with pagination
   */
  getAllRecords: async (
    params?: BVNQueryParams
  ): Promise<BVNRecordsResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) {
        queryParams.append("page", params.page.toString());
      }
      if (params?.limit) {
        queryParams.append("limit", params.limit.toString());
      }
      if (params?.search) {
        queryParams.append("search", params.search);
      }
      if (params?.bvn) {
        queryParams.append("bvn", params.bvn);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `/verifications/bvn/records?${queryString}`
        : "/verifications/bvn/records";

      const response = await bvnApiClient
        .get<BVNRecordsResponse>(url)
        .then((res) => res.data);

      if (!response.status) {
        throw new Error(response.message || "Failed to fetch BVN records");
      }

      return response;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to fetch BVN records");
      }
    }
  },

  /**
   * Search BVN by number
   */
  searchByBVN: async (bvn: string): Promise<BVNRecordsResponse> => {
    return bvnService.getAllRecords({ bvn, limit: 10 });
  },

  /**
   * Get BVN records with pagination
   */
  getRecordsPaginated: async (
    page: number = 1,
    limit: number = 10
  ): Promise<BVNRecordsResponse> => {
    return bvnService.getAllRecords({ page, limit });
  },

  /**
   * Get single BVN record details by BVN number
   */
  getBVNDetails: async (bvn: string): Promise<BVNDetailResponse> => {
    try {
      const response = await bvnApiClient
        .get<BVNDetailResponse>(`/verifications/bvn/records/${bvn}`)
        .then((res) => res.data);

      if (!response.status) {
        throw new Error(response.message || "Failed to fetch BVN details");
      }

      return response;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to fetch BVN details");
      }
    }
  },
};
