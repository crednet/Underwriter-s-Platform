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

// Loan Analysis Types
export interface Statement {
  id: string;
  pTransactionDate: string;
  pValueDate: string;
  pNarration: string;
  pCredit: string;
  pDebit: string;
  pBalance: string;
  statementId: string;
}

export interface CreditAnalysis {
  totalLoansCount: number;
  closedLoansCount: number;
  performingLoansCount: number;
  hasNonPerformingLoans: boolean;
}

export interface Decision {
  id: string;
  decisionType: string;
  decisionSource: string;
  loanBotStatus: string;
  approvedAmount?: string;
  recommendedLimit?: string;
  calcMonthlyIncome?: string;
  accountHolder?: string;
  accountNumber?: string;
  referenceNumber?: string;
  reportedSalary?: string;
  employmentType?: string;
  creditCardLimit?: string;
  shoppingLimit?: string;
  creditAnalysis?: CreditAnalysis;
  metadata?: {
    statementId?: string;
  };
}

export interface LoanPerformance {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  accountNumber: string;
  loanProvider: string;
  loanAmount: number;
  outstandingBalance: number;
  overdueAmount: number;
  noOfPerforming: number;
  noOfNonPerforming: number;
  loanCount: number;
  performanceStatus: string;
  status: string;
}

export interface CreditReportScore {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  creditReportId: string;
  totalNoOfDelinquentFacilities: number;
  totalNoOfLoans: number;
  totalNoOfActiveLoans: number;
  totalNoOfClosedLoans: number;
  maxNoOfDays: number;
  totalNoOfInstitutions: number;
  totalOverdue: number;
  totalBorrowed: number;
  highestLoanAmount: number;
  totalOutstanding: number;
  totalMonthlyInstallment: number;
  totalNoOfOverdueAccounts: number;
  totalNoOfPerformingLoans: number;
  firstCentralEnquiryResultID: string | null;
  firstCentralEnquiryEngineID: string | null;
  searchedDate: string;
  performingLoanCount: number | null;
  nonPerformingLoanCount: number | null;
  closedLoansCount: number | null;
  openLoansCount: number | null;
  recencyDays: number | null;
  averageDebitService: number | null;
  debitService: number | null;
  averageDefault: number | null;
}

export interface CreditReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string | null;
  bvn: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  email: string;
  status: string | null;
  scores: CreditReportScore[];
}

export interface CreditScore {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  creditReportId: string;
  loanPerformances: LoanPerformance[];
}

export interface LoanAnalysisData {
  userId: string;
  statements: Statement[];
  decisions: Decision[];
  creditReport: CreditReport | null;
  creditScores: CreditScore[];
  summary: {
    totalStatements: number;
    totalDecisions: number;
    hasCreditReport: boolean;
    totalCreditScores: number;
    bvn: string | null;
  };
}

export interface LoanAnalysisResponse {
  data: LoanAnalysisData;
  message: string;
}

// Create separate axios instance for Loan Analysis API (Loan Bot API)
const loanAnalysisApiClient: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_LOANBOT_BASE_URL || "http://172.16.0.18:7017/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token
loanAnalysisApiClient.interceptors.request.use(
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
loanAnalysisApiClient.interceptors.response.use(
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

  /**
   * Get loan analysis data for a user (decisions, statements, credit report, scores)
   */
  getUserLoanAnalysis: async (
    userId: string
  ): Promise<LoanAnalysisResponse> => {
    try {
      const response = await loanAnalysisApiClient
        .get<LoanAnalysisResponse>(`/admin/users/${userId}`)
        .then((res) => res.data);

      return response;
    } catch (error: unknown) {
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
      throw new Error("Failed to fetch loan analysis data");
    }
  },
};
