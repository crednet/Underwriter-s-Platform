import axios, { type AxiosInstance, AxiosError } from "axios";

// Credit Applications API Configuration (Credit Companion API)
const CREDIT_API_BASE_URL =
  import.meta.env.VITE_CREDIT_COMPANION_API_BASE_URL ||
  "http://172.16.0.18:7007/api";

// Create separate axios instance for Credit Applications API
const creditApiClient: AxiosInstance = axios.create({
  baseURL: CREDIT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
creditApiClient.interceptors.request.use(
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
creditApiClient.interceptors.response.use(
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

// Credit Application Types
export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface CreditApplication {
  id: string;
  userId: string;
  bvn: string;
  accountNumber: string;
  bankCode: string;
  accountName: string | null;
  accountNameMatch: boolean;
  hasProcessedNameMatch: boolean;
  userNameMatch: boolean;
  creditReportStatus: "pending" | "approved" | "not_approved";
  reason: string | null;
  creditReportReason: string | null;
  statementRequestReference: string | null;
  creditReportLimit: number | null;
  bankStatementStatus: "pending" | "approved" | "not_approved" | "cancelled";
  bankStatementLimit: number | null;
  creditReportTrialCount: number;
  bankStatementTrialCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: UserInfo;
}

export interface CreditApplicationMetadata {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

export interface CreditApplicationsResponse {
  data: {
    items: CreditApplication[];
    meta: CreditApplicationMetadata;
  };
  message: string;
}

export interface CreditApplicationDetailResponse {
  data: CreditApplication;
  message: string;
}

export interface CreditApplicationQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  bvn?: string;
  accountNumber?: string;
  creditReportStatus?: string;
  bankStatementStatus?: string;
}

// Action Response Types
export interface DeclineApplicationResponse {
  data: any;
  message: string;
}

export interface ApproveApplicationResponse {
  data: any;
  message: string;
}

export interface ReviewLimitResponse {
  data: any;
  message: string;
}

// Credit Applications Service
export const creditApplicationService = {
  /**
   * Get all credit applications with pagination and optional filters
   */
  getAllApplications: async (
    params?: CreditApplicationQueryParams
  ): Promise<CreditApplicationsResponse> => {
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
      if (params?.accountNumber) {
        queryParams.append("accountNumber", params.accountNumber);
      }
      if (params?.creditReportStatus) {
        queryParams.append("creditReportStatus", params.creditReportStatus);
      }
      if (params?.bankStatementStatus) {
        queryParams.append("bankStatementStatus", params.bankStatementStatus);
      }

      const queryString = queryParams.toString();
      const url = queryString
        ? `/admin/credit-applications?${queryString}`
        : "/admin/credit-applications";

      const response = await creditApiClient
        .get<CreditApplicationsResponse>(url)
        .then((res) => res.data);

      return response;
    } catch (error: unknown) {
      console.error("Credit applications fetch error:", error);

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
      throw new Error("Failed to fetch credit applications");
    }
  },

  /**
   * Get credit applications with pagination
   */
  getApplicationsPaginated: async (
    page: number = 1,
    limit: number = 100
  ): Promise<CreditApplicationsResponse> => {
    return creditApplicationService.getAllApplications({ page, limit });
  },

  /**
   * Get a single credit application by ID
   */
  getApplicationById: async (
    applicationId: string
  ): Promise<CreditApplicationDetailResponse> => {
    try {
      const response = await creditApiClient
        .get<CreditApplicationDetailResponse>(
          `/admin/credit-applications/${applicationId}`
        )
        .then((res) => res.data);

      return response;
    } catch (error: unknown) {
      console.error("Credit application detail fetch error:", error);

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
      throw new Error("Failed to fetch credit application details");
    }
  },

  /**
   * Decline a user's application
   */
  declineApplication: async (
    userId: string,
    reason: string
  ): Promise<DeclineApplicationResponse> => {
    try {
      const response = await creditApiClient
        .post<DeclineApplicationResponse>(
          `/admin/credit-applications/decline-application/${userId}`,
          { reason }
        )
        .then((res) => res.data);

      return response;
    } catch (error: unknown) {
      console.error("Decline application error:", error);

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
      throw new Error("Failed to decline application");
    }
  },

  /**
   * Approve a user's application
   */
  approveApplication: async (
    userId: string,
    creditLimit: number
  ): Promise<ApproveApplicationResponse> => {
    try {
      const response = await creditApiClient
        .post<ApproveApplicationResponse>(
          `/admin/credit-applications/approve-application/${userId}`,
          { creditLimit }
        )
        .then((res) => res.data);

      return response;
    } catch (error: unknown) {
      console.error("Approve application error:", error);

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
      throw new Error("Failed to approve application");
    }
  },

  /**
   * Review and adjust a user's credit limit
   */
  reviewLimit: async (
    userId: string,
    action: "increase" | "decrease",
    newLimit: number
  ): Promise<ReviewLimitResponse> => {
    try {
      const response = await creditApiClient
        .post<ReviewLimitResponse>(
          `/admin/credit-applications/review-limit/${userId}`,
          { action, newLimit }
        )
        .then((res) => res.data);

      return response;
    } catch (error: unknown) {
      console.error("Review limit error:", error);

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
      throw new Error("Failed to review credit limit");
    }
  },
};
