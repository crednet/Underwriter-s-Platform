import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Alert, Modal } from "../components/ui";
import { creditApplicationService, type CreditApplication } from "../services";
import { getUserProfileRoute } from "../constants/routes";

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<CreditApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(100);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "userId" | "bvn" | "accountNumber"
  >("bvn");
  const [creditReportFilter, setCreditReportFilter] = useState<string>("");
  const [bankStatementFilter, setBankStatementFilter] = useState<string>("");

  // Details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<CreditApplication | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch applications
  const fetchApplications = async (
    page: number,
    search?: string,
    creditStatus?: string,
    bankStatus?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit,
      };

      // Add search parameter
      if (search && search.trim()) {
        if (searchType === "userId") {
          params.userId = search.trim();
        } else if (searchType === "bvn") {
          params.bvn = search.trim();
        } else if (searchType === "accountNumber") {
          params.accountNumber = search.trim();
        }
      }

      // Add filter parameters
      if (creditStatus && creditStatus !== "") {
        params.creditReportStatus = creditStatus;
      }
      if (bankStatus && bankStatus !== "") {
        params.bankStatementStatus = bankStatus;
      }

      const response = await creditApplicationService.getAllApplications(
        params
      );
      setApplications(response.data.items);
      setCurrentPage(response.data.meta.page);
      setTotalPages(response.data.meta.totalPages);
      setTotalRecords(response.data.meta.total);
    } catch (error: unknown) {
      console.error("Failed to fetch applications:", error);
      const axiosError = error as any;

      // Check for 401/403 errors - these should be handled by the interceptor
      // but we add this check to ensure proper handling
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 403
      ) {
        console.warn(
          "Authentication error detected, clearing tokens and redirecting..."
        );
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("user_permissions");
        localStorage.removeItem("user_roles");
        window.location.href = "/login";
        return;
      }

      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch applications. Please try again.";
      setError(errorMessage);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchApplications(1);
  }, []);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchApplications(
      newPage,
      searchQuery,
      creditReportFilter,
      bankStatementFilter
    );
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchApplications(1, query, creditReportFilter, bankStatementFilter);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    fetchApplications(1, "", creditReportFilter, bankStatementFilter);
  };

  // Handle credit report filter
  const handleCreditReportFilter = (status: string) => {
    setCreditReportFilter(status);
    fetchApplications(1, searchQuery, status, bankStatementFilter);
  };

  // Handle bank statement filter
  const handleBankStatementFilter = (status: string) => {
    setBankStatementFilter(status);
    fetchApplications(1, searchQuery, creditReportFilter, status);
  };

  // Handle view details
  const handleViewDetails = async (applicationId: string) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      const response = await creditApplicationService.getApplicationById(
        applicationId
      );
      setSelectedApplication(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch application details:", error);
      const axiosError = error as any;

      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch application details";
      setError(errorMessage);
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "not_approved":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Credit Applications
        </h1>
        <p className="text-gray-600 mt-1">
          Manage and review credit applications
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Search Section */}
      <Card
        title="Search Applications"
        subtitle="Filter by User ID, BVN, or Account Number"
      >
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSearchType("bvn")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === "bvn"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Search by BVN
            </button>
            <button
              onClick={() => setSearchType("userId")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === "userId"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Search by User ID
            </button>
            <button
              onClick={() => setSearchType("accountNumber")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === "accountNumber"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Search by Account #
            </button>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder={
                searchType === "userId"
                  ? "Enter User ID..."
                  : searchType === "accountNumber"
                  ? "Enter Account Number..."
                  : "Enter BVN number..."
              }
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
            />
            <Button
              variant="outline"
              onClick={handleClearSearch}
              disabled={!searchQuery.trim()}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters Section */}
      <Card title="Filter Applications" subtitle="Filter by status">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Report Status
            </label>
            <select
              value={creditReportFilter}
              onChange={(e) => handleCreditReportFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="not_approved">Not Approved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Statement Status
            </label>
            <select
              value={bankStatementFilter}
              onChange={(e) => handleBankStatementFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="not_approved">Not Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Applications Table */}
      <Card
        title="Applications"
        subtitle={`Total: ${totalRecords.toLocaleString()} applications`}
        padding="none"
      >
        {loading && applications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading applications...</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery.trim()
                ? `No applications match "${searchQuery}". Try a different search.`
                : "No applications found"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      BVN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bank Statement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {app.userId}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {app.user.firstName} {app.user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {app.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {app.bvn}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{app.accountNumber}</div>
                        <div className="text-xs text-gray-500">
                          {app.accountName || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            app.creditReportStatus
                          )}`}
                        >
                          {formatStatus(app.creditReportStatus)}
                        </span>
                        {app.creditReportReason && (
                          <div className="text-xs text-gray-500 mt-1">
                            {app.creditReportReason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            app.bankStatementStatus
                          )}`}
                        >
                          {formatStatus(app.bankStatementStatus)}
                        </span>
                        {app.reason && (
                          <div className="text-xs text-gray-500 mt-1">
                            {app.reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(app.id)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(getUserProfileRoute(app.userId))
                            }
                            className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                          >
                            View Profile
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 px-6 pb-4">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} (
                {totalRecords.toLocaleString()} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        handlePageChange(page);
                      }
                    }}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  />
                  <span className="text-sm text-gray-600">/ {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Application Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedApplication(null);
        }}
        title="Application Details"
        size="xl"
      >
        {loadingDetails ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">
                Loading application details...
              </p>
            </div>
          </div>
        ) : selectedApplication ? (
          <div className="space-y-6">
            {/* Applicant Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Applicant Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.user.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.user.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* BVN & Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                BVN & Account Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.userId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">BVN</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.bvn}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bank Code</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.bankCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.accountName || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Verification */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Verification
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Account Name Match</p>
                  <p className="font-medium">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedApplication.accountNameMatch
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedApplication.accountNameMatch
                        ? "✓ Match"
                        : "✗ No Match"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">User Name Match</p>
                  <p className="font-medium">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedApplication.userNameMatch
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedApplication.userNameMatch
                        ? "✓ Match"
                        : "✗ No Match"}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Processed Name Match</p>
                  <p className="font-medium">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedApplication.hasProcessedNameMatch
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedApplication.hasProcessedNameMatch
                        ? "✓ Yes"
                        : "✗ No"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Report Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Credit Report
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedApplication.creditReportStatus
                      )}`}
                    >
                      {formatStatus(selectedApplication.creditReportStatus)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trial Count</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.creditReportTrialCount}
                  </p>
                </div>
                {selectedApplication.creditReportReason && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Reason</p>
                    <p className="font-medium text-gray-900">
                      {selectedApplication.creditReportReason}
                    </p>
                  </div>
                )}
                {selectedApplication.creditReportLimit && (
                  <div>
                    <p className="text-sm text-gray-600">Limit</p>
                    <p className="font-medium text-gray-900">
                      {selectedApplication.creditReportLimit}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Statement Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bank Statement
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedApplication.bankStatementStatus
                      )}`}
                    >
                      {formatStatus(selectedApplication.bankStatementStatus)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trial Count</p>
                  <p className="font-medium text-gray-900">
                    {selectedApplication.bankStatementTrialCount}
                  </p>
                </div>
                {selectedApplication.reason && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Reason</p>
                    <p className="font-medium text-gray-900">
                      {selectedApplication.reason}
                    </p>
                  </div>
                )}
                {selectedApplication.statementRequestReference && (
                  <div>
                    <p className="text-sm text-gray-600">Request Reference</p>
                    <p className="font-medium text-gray-900">
                      {selectedApplication.statementRequestReference}
                    </p>
                  </div>
                )}
                {selectedApplication.bankStatementLimit && (
                  <div>
                    <p className="text-sm text-gray-600">Limit</p>
                    <p className="font-medium text-gray-900">
                      {selectedApplication.bankStatementLimit}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Record Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedApplication.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Updated</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedApplication.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No details available</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
