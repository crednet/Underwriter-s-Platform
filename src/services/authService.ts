import { api } from "./api";
import type { User } from "../types";

// Login request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    company_id: number;
    name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    status: string;
    logged_in_at: string;
    profile: {
      id: number;
      date_of_birth: string;
      bvn: string;
      salary: string;
      credit_limit: number;
      status: string;
      employment_status: string;
      created_at: string;
      [key: string]: any;
    };
    permissions: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    roles: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    created_at: string;
    [key: string]: any;
  };
  keys: {
    paystack_public_key: string;
    korapay_public_key: string;
  };
  account_state: {
    user_has_active_plan: boolean;
    user_has_active_card: boolean;
    user_has_paid_for_card_activation: boolean;
    has_bank_statement: boolean;
    has_work_id_document: boolean;
    has_emp_letter: boolean;
    has_govt_id_document: boolean;
  };
  success: boolean;
  message: string;
}

// Auth Service
export const authService = {
  /**
   * Login user with email and password
   */
  login: async (
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> => {
    try {
      const response = await api.post<LoginResponse>("/login", {
        email,
        password,
      });

      // Check if login was successful
      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      const token = response.token;

      if (!token) {
        throw new Error("No authentication token received");
      }

      // Store token in localStorage
      localStorage.setItem("auth_token", token);

      // Map role from roles array - use first role or default to UNDERWRITER
      let userRole: string = "UNDERWRITER";
      if (response.user.roles && response.user.roles.length > 0) {
        const roleSlug = response.user.roles[0].slug;
        // Map backend roles to frontend roles
        if (roleSlug.includes("admin")) {
          userRole = "ADMIN";
        } else if (
          roleSlug.includes("senior") ||
          roleSlug.includes("supervisor")
        ) {
          userRole = "SENIOR_UNDERWRITER";
        } else if (roleSlug.includes("analyst")) {
          userRole = "ANALYST";
        } else {
          userRole = "UNDERWRITER";
        }
      }

      // Normalize user data to match frontend User type
      const user: User = {
        id: String(response.user.id),
        email: response.user.email,
        firstName: response.user.name,
        lastName: response.user.last_name,
        role: userRole as any,
        department:
          response.user.profile?.employment_status || "Credit Assessment",
        createdAt: response.user.created_at,
        lastLogin: response.user.logged_in_at,
      };

      // Store user in localStorage
      localStorage.setItem("auth_user", JSON.stringify(user));

      // Optionally store additional data
      localStorage.setItem(
        "user_permissions",
        JSON.stringify(response.user.permissions)
      );
      localStorage.setItem("user_roles", JSON.stringify(response.user.roles));

      return { user, token };
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different error formats
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      // Optional: Call logout endpoint if backend requires it
      // await api.post('/logout');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all auth-related data from local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("user_permissions");
      localStorage.removeItem("user_roles");
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  /**
   * Get auth token from localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },
};
