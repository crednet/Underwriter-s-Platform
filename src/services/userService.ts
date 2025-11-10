import axios, { type AxiosInstance, AxiosError } from "axios";

// User API Configuration
const USER_API_BASE_URL =
  import.meta.env.VITE_USER_API_BASE_URL || "http://172.16.0.18:7007/api";

// Create separate axios instance for User API
const userApiClient: AxiosInstance = axios.create({
  baseURL: USER_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
userApiClient.interceptors.request.use(
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
userApiClient.interceptors.response.use(
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

// User Profile Types based on actual API response
export interface UserProfile {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phoneNo: string;
  source: string;
  status: string;
  loanbotDecision: string | null;
  isBlacklisted: number;
  operatingSystem: string;
}

export interface UserProfileDetails {
  id: string;
  userId: string;
  dateOfBirth: string;
  jobTitle: string | null;
  gender: string | null;
  maritalStatus: string | null;
  bvn: string;
  additionalPhone: string | null;
  address: string;
  location: string | null;
  state: string;
  lga: string;
  education: string | null;
  employer: string;
  companyIndustry: string | null;
  companyAddress: string | null;
  empType: string | null;
  salary: string;
  detectedSalary: string | null;
  debtToIncomeRatio: string | null;
  position: string | null;
  currentLoanFacility: string | null;
  accountNo: string | null;
  bankName: string | null;
  standardLoanLimit: number;
  standardLoanInterestRate: number;
  creditLimit: number;
  boltCreditLimit: number | null;
  boltCreditUsed: number | null;
  boltCreditAvailable: number | null;
  salaryDay: number | null;
  billingDate: number;
  paymentDate: number;
  status: string;
  idType: string | null;
  idNumber: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  idIssuedDate: string | null;
  idExpiryDate: string | null;
  riskProfileId: string | null;
  referralCode: string;
  referralLink: string;
  bvnFirstName: string | null;
  bvnMiddleName: string | null;
  bvnLastName: string | null;
  ninFirstName: string | null;
  ninMiddleName: string | null;
  ninLastName: string | null;
  ninPhoneNo: string | null;
  ninDateOfBirth: string | null;
  verifyMethod: string | null;
  trialBankCode: string | null;
  trialAccountNo: string | null;
  trialBankAccountName: string | null;
  employmentStatus: string;
  companyDescription: string | null;
  companyStartMonth: string | null;
  companyStartYear: string | null;
  companyRegistrationNumber: string | null;
  previousFormalJob: string | null;
  companyWebsite: string | null;
  companyTwitterUrl: string | null;
  companyInstagramUrl: string | null;
  companyMonthlyIncome: string | null;
  companyMonthlyProfit: string | null;
  companySize: string | null;
  bankAccountName: string | null;
  paysSalary: string | null;
  nin: string | null;
  linkToContact: string;
  trialWorkEmail: string | null;
  nextLoanRequestAt: string | null;
  stateId: string | null;
  lgaId: string | null;
  nextOfKinName: string | null;
  nextOfKinEmail: string | null;
  nextOfKinPhoneNo: string | null;
  nextOfKinAddress: string | null;
  nextOfKinRelationship: string | null;
  onboardedFor: string | null;
  educationalLevel: string | null;
  employmentRole: string | null;
  cardActivationPaid: string | null;
  preferences: any[];
  hasGoodCreditHistory: string | null;
  securedInvestmentStatus: string | null;
}

export interface UserDocument {
  id: string;
  userId: string;
  filename: string;
  url: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  comments: string | null;
}

export interface UserSelfie {
  id: number;
  userId: string;
  bvn: string;
  image: string;
  response: {
    bvn: string;
    confidence: number;
    similarity: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserBVNData {
  _id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  phoneNumber1: string;
  phoneNumber2: string | null;
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

export interface LoanbotStatement {
  id: string;
  userId: string;
  accountNumber: string;
  bankName: string;
  statementPeriod: string;
  balance: number;
  transactions: any[];
  analysisResult: any;
  createdAt: string;
}

export interface LoanbotDecision {
  id: string;
  userId: string;
  applicationId: string;
  decision: "approved" | "rejected" | "pending";
  creditScore: number;
  riskLevel: "low" | "medium" | "high";
  loanAmount: number;
  interestRate: number;
  tenure: number;
  reasons: string[];
  createdAt: string;
}

export interface PersonalCardAccount {
  id: string;
  userId: string;
  accountNo: string;
  availableBalance: string;
  bnplBalance: string;
  creditCardLimit: string;
  availableCredit: string;
  status: string;
  repaymentPercentage: string;
  pinStatus: string;
  freemium: number;
  ongoingCharge: number;
  creditCardLimitIncreasedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  provider: string | null;
  type: string;
  cycleStatus: string | null;
  mandateStatus: string;
  canCalculateDefault: number;
  freemiumExpireDate: string;
}

export interface UserProfileResponse {
  data: UserProfile;
  message: string;
}

export interface UserDocumentsResponse {
  data: UserDocument[];
  message: string;
}

export interface UserSelfiesResponse {
  data: UserSelfie[];
  message: string;
}

export interface UserBVNResponse {
  data: UserBVNData;
  message: string;
}

export interface LoanbotStatementsResponse {
  data: LoanbotStatement[];
  message: string;
}

export interface LoanbotDecisionsResponse {
  data: LoanbotDecision[];
  message: string;
}

export interface PersonalCardAccountsResponse {
  data: PersonalCardAccount[];
  message: string;
}

// Complete user details response interface
export interface UserCompleteDetailsResponse {
  data: {
    user: UserProfile;
    userProfile: UserProfileDetails;
    selfieAttempts: UserSelfie[];
    documents: UserDocument[];
    personalCardAccounts: PersonalCardAccount;
    bvnData: UserBVNData;
  };
  message: string;
}

// User Service
export const userService = {
  /**
   * Get complete user details by ID (single API call)
   */
  getUserCompleteDetails: async (
    userId: string
  ): Promise<UserCompleteDetailsResponse> => {
    try {
      const response = await userApiClient
        .get<UserCompleteDetailsResponse>(
          `/admin/user-complete-details/${userId}`
        )
        .then((res) => res.data);

      return response;
    } catch (error: unknown) {
      console.error("User complete details fetch error:", error);
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
      throw new Error("Failed to fetch user complete details");
    }
  },
};
