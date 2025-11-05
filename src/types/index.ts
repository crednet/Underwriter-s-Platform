// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

export type UserRole =
  | "ADMIN"
  | "SENIOR_UNDERWRITER"
  | "UNDERWRITER"
  | "ANALYST";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface BVNData {
  id: string;
  bvn: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  phoneNumber: string;
  email?: string;
  gender: "MALE" | "FEMALE";
  address: string;
  stateOfOrigin: string;
  lga: string;
  nationality: string;
  maritalStatus: string;
  watchlistStatus: "CLEAR" | "FLAGGED" | "UNDER_REVIEW";
  enrollmentBank: string;
  enrollmentBranch: string;
  registrationDate: string;
  imageUrl?: string;
  verificationStatus: VerificationStatus;
  lastVerified?: string;
}

export interface SelfieData {
  id: string;
  applicationId: string;
  applicantName: string;
  selfieUrl: string;
  bvnPhotoUrl?: string;
  matchScore: number;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  metadata: {
    captureDate: string;
    deviceInfo?: string;
    location?: Coordinates;
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationRecord {
  id: string;
  applicationId: string;
  applicantName: string;
  timestamp: string;
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  country: string;
  accuracy: number;
  locationType: "HOME" | "WORK" | "CURRENT" | "OTHER";
  verificationStatus: VerificationStatus;
  notes?: string;
}

export interface BankStatement {
  id: string;
  applicationId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountType: "SAVINGS" | "CURRENT" | "DOMICILIARY";
  currency: string;
  statementPeriod: {
    startDate: string;
    endDate: string;
  };
  openingBalance: number;
  closingBalance: number;
  averageBalance: number;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
  transactions: Transaction[];
  analysis: StatementAnalysis;
  uploadedAt: string;
  verificationStatus: VerificationStatus;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  category?: TransactionCategory;
  flags?: string[];
}

export type TransactionCategory =
  | "SALARY"
  | "TRANSFER"
  | "WITHDRAWAL"
  | "DEPOSIT"
  | "LOAN_REPAYMENT"
  | "BILL_PAYMENT"
  | "PURCHASE"
  | "OTHER";

export interface StatementAnalysis {
  salaryPattern: {
    detected: boolean;
    averageAmount?: number;
    frequency?: "MONTHLY" | "BIWEEKLY" | "WEEKLY";
    lastSalaryDate?: string;
  };
  loanRepayments: {
    detected: boolean;
    totalAmount: number;
    count: number;
  };
  gamblingActivity: {
    detected: boolean;
    totalAmount: number;
    frequency: number;
  };
  bounceRate: number;
  cashFlowRatio: number;
  riskScore: number;
  flags: string[];
}

export interface CreditApplication {
  id: string;
  applicationNumber: string;
  applicantInfo: ApplicantInfo;
  loanDetails: LoanDetails;
  creditReport?: CreditReport;
  loanPerformance?: LoanPerformance;
  bvnData?: BVNData;
  selfieVerification?: SelfieData;
  locationRecords: LocationRecord[];
  bankStatements: BankStatement[];
  status: ApplicationStatus;
  decision?: UnderwritingDecision;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface ApplicantInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  maritalStatus: string;
  address: string;
  city: string;
  state: string;
  employmentStatus: "EMPLOYED" | "SELF_EMPLOYED" | "UNEMPLOYED";
  employer?: string;
  monthlyIncome: number;
  bvn: string;
}

export interface LoanDetails {
  requestedAmount: number;
  approvedAmount?: number;
  tenure: number;
  interestRate: number;
  purpose: string;
  repaymentFrequency: "DAILY" | "WEEKLY" | "MONTHLY";
  collateral?: string;
}

export interface CreditReport {
  id: string;
  creditScore: number;
  creditBureau: "CRC" | "FIRSTCENTRAL" | "CREDITREGISTRY";
  reportDate: string;
  activeLoans: number;
  totalOutstanding: number;
  performingLoans: number;
  nonPerformingLoans: number;
  creditHistory: CreditHistoryItem[];
  inquiries: CreditInquiry[];
  riskRating: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
}

export interface CreditHistoryItem {
  lender: string;
  loanType: string;
  amount: number;
  disbursementDate: string;
  status: "ACTIVE" | "CLOSED" | "DEFAULTED";
  performanceStatus: "PERFORMING" | "NON_PERFORMING";
  daysInArrears: number;
}

export interface CreditInquiry {
  date: string;
  institution: string;
  purpose: string;
}

export interface LoanPerformance {
  totalLoans: number;
  activeLoans: number;
  closedLoans: number;
  defaultedLoans: number;
  totalDisbursed: number;
  totalRepaid: number;
  outstandingBalance: number;
  averageRepaymentRate: number;
  longestDPD: number; // Days Past Due
  currentDPD: number;
  performanceRating: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
}

export type ApplicationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type VerificationStatus = "PENDING" | "VERIFIED" | "FAILED" | "FLAGGED";

export interface UnderwritingDecision {
  id: string;
  applicationId: string;
  decision: DecisionType;
  approvedAmount?: number;
  recommendedTenure?: number;
  recommendedInterestRate?: number;
  reasoning: string;
  conditions?: string[];
  decidedBy: string;
  decidedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type DecisionType =
  | "APPROVE"
  | "REJECT"
  | "INCREASE_LIMIT"
  | "REDUCE_LIMIT"
  | "DECLINE"
  | "REQUEST_MORE_INFO";

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: "APPLICATION" | "USER" | "DECISION" | "VERIFICATION";
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export type AuditAction =
  | "VIEW"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "ASSIGN"
  | "COMMENT"
  | "EXPORT"
  | "LOGIN"
  | "LOGOUT";

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}
