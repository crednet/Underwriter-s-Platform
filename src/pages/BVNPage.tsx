import React, { useState, useEffect } from "react";
import { Card, Input, Button, Modal, Alert } from "../components/ui";
import { bvnService, type BVNRecord, type BVNDetailRecord } from "../services";

export const BVNPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [bvnRecords, setBvnRecords] = useState<BVNRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(100);
  const [pageInputValue, setPageInputValue] = useState("1");

  // Direct BVN lookup state
  const [directBVN, setDirectBVN] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBVN, setSelectedBVN] = useState<BVNDetailRecord | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch BVN records
  const fetchBVNRecords = async (page: number, search?: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching BVN records with params:", { page, limit, search });
      const response = await bvnService.getAllRecords({
        page,
        limit,
        search: search || undefined,
      });
      setBvnRecords(response.data);
      console.log("API Response meta:", response.meta);
      console.log("Setting currentPage to:", response.meta.currentPage);
      setCurrentPage(response.meta.currentPage);
      setPageInputValue(response.meta.currentPage.toString());
      setTotalPages(response.meta.totalPages);
      setTotalRecords(response.meta.totalRecords);
    } catch (error: any) {
      console.error("Failed to fetch BVN records:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch BVN records. Please try again.";
      setError(errorMessage);
      setBvnRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch records on component mount
  useEffect(() => {
    fetchBVNRecords(1);
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchBVNRecords(1, searchQuery);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    console.log("Changing to page:", newPage, "Current page:", currentPage);
    if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
      fetchBVNRecords(newPage, searchQuery);
    }
  };

  // Handle view details
  const handleViewDetails = async (bvn: string) => {
    try {
      setLoadingDetails(true);
      setShowDetailsModal(true);
      setError(null);
      const response = await bvnService.getBVNDetails(bvn);
      setSelectedBVN(response.data);
    } catch (error: any) {
      console.error("Failed to fetch BVN details:", error);

      // Handle different error scenarios
      let errorMessage = "Failed to fetch BVN details. Please try again.";

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        if (status === 404) {
          errorMessage = "BVN details not found.";
        } else if (status === 400) {
          errorMessage = serverMessage || "Invalid request. Please try again.";
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (error.request) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setShowDetailsModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle direct BVN lookup
  const handleDirectLookup = async () => {
    if (!directBVN.trim()) {
      setError("Please enter a BVN number");
      return;
    }

    // Validate BVN format (11 digits)
    if (directBVN.trim().length !== 11) {
      setError("BVN must be exactly 11 digits");
      return;
    }

    if (!/^\d{11}$/.test(directBVN.trim())) {
      setError("BVN must contain only numbers");
      return;
    }

    try {
      setLookupLoading(true);
      setError(null);
      const response = await bvnService.getBVNDetails(directBVN.trim());
      setSelectedBVN(response.data);
      setShowDetailsModal(true);
      setDirectBVN(""); // Clear input on success
    } catch (error: any) {
      console.error("Failed to lookup BVN:", error);

      // Handle different error scenarios
      let errorMessage = "Failed to lookup BVN. Please try again.";

      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        if (status === 404) {
          errorMessage =
            "BVN not found. Please verify the BVN number and try again.";
        } else if (status === 400) {
          errorMessage =
            serverMessage || "Invalid BVN format. Please check and try again.";
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.message) {
        // Other errors
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">BVN Verification</h1>
        <p className="text-gray-600 mt-1">
          Search and verify Bank Verification Numbers
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

      {/* Direct BVN Lookup Section */}
      <Card
        title="Direct BVN Lookup"
        subtitle="Search for any BVN number, even if not in the database"
      >
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Enter 11-digit BVN number"
              value={directBVN}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 11) {
                  setDirectBVN(value);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && directBVN.trim().length === 11) {
                  handleDirectLookup();
                }
              }}
              fullWidth
              maxLength={11}
            />
            {directBVN.length > 0 && (
              <p
                className={`text-xs mt-1 ${
                  directBVN.length === 11 ? "text-success-600" : "text-gray-500"
                }`}
              >
                {directBVN.length}/11 digits
                {directBVN.length === 11 && " ✓"}
              </p>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleDirectLookup}
            disabled={lookupLoading || directBVN.trim().length !== 11}
            isLoading={lookupLoading}
          >
            {lookupLoading ? "Looking up..." : "Lookup BVN"}
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Enter a BVN number to fetch details directly from the verification
          system
        </p>
      </Card>

      {/* Search Section */}
      <Card
        title="Search Database"
        subtitle="Search through existing BVN records in the database"
      >
        <div className="flex gap-4">
          <Input
            placeholder="Search by BVN, name, or phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            fullWidth
          />
          <Button variant="primary" onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Total Records: {totalRecords.toLocaleString()}
        </div>
      </Card>

      {/* Results Section */}
      <Card title="BVN Records" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BVN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marital Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading BVN records...
                  </td>
                </tr>
              ) : bvnRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No BVN records found. Try adjusting your search.
                  </td>
                </tr>
              ) : (
                bvnRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.bvn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.maritalStatus}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.createdAt
                        ? new Date(record.createdAt).toLocaleDateString()
                        : record.registrationDate
                        ? new Date(record.registrationDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(record.bvn)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && bvnRecords.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages.toLocaleString()} (
              {totalRecords.toLocaleString()} total records)
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
                <span className="text-sm text-gray-700">Page</span>
                <Input
                  type="number"
                  value={pageInputValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPageInputValue(value);
                  }}
                  onKeyDown={(e) => {
                    // Handle Enter key
                    if (e.key === "Enter") {
                      const page = parseInt(pageInputValue, 10);
                      if (!isNaN(page) && page > 0 && page <= totalPages) {
                        handlePageChange(page);
                      } else {
                        // Reset to current page if invalid
                        setPageInputValue(currentPage.toString());
                      }
                    }
                  }}
                  onBlur={() => {
                    // Handle when user clicks away
                    if (pageInputValue === "") {
                      // Reset to current page if empty
                      setPageInputValue(currentPage.toString());
                      return;
                    }
                    const page = parseInt(pageInputValue, 10);
                    if (!isNaN(page) && page > 0 && page <= totalPages) {
                      handlePageChange(page);
                    } else {
                      // Reset to current page if invalid
                      setPageInputValue(currentPage.toString());
                    }
                  }}
                  className="w-20 text-center"
                  min={1}
                  max={totalPages}
                />
                <span className="text-sm text-gray-700">
                  of {totalPages.toLocaleString()}
                </span>
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
        )}
      </Card>

      {/* BVN Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBVN(null);
        }}
        title="BVN Details"
        size="xl"
      >
        {loadingDetails ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading BVN details...</p>
          </div>
        ) : selectedBVN ? (
          <div className="space-y-6">
            {/* Photo and Basic Info */}
            <div className="flex gap-6">
              {/* Photo */}
              <div className="flex-shrink-0">
                {selectedBVN.photoUrl ? (
                  <img
                    src={selectedBVN.photoUrl}
                    alt={`${selectedBVN.firstName} ${selectedBVN.lastName}`}
                    className="w-40 h-40 rounded-lg object-cover border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/160x160?text=No+Photo";
                    }}
                  />
                ) : (
                  <div className="w-40 h-40 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Photo</span>
                  </div>
                )}
                {selectedBVN.watchlisted && (
                  <div className="mt-2 px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full text-center">
                    ⚠️ Watchlisted
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Middle Name</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.middleName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">BVN</p>
                  <p className="font-medium text-gray-900">{selectedBVN.bvn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.dateOfBirth}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.gender}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Phone Number 1</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.phoneNumber1}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number 2</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.phoneNumber2 || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Marital Status</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.maritalStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Location Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">State of Origin</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.stateOfOrigin}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">LGA of Origin</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.lgaOfOrigin}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">LGA of Residence</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.lgaOfResidence}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIN</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.nin || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Registration Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Registration Date</p>
                  <p className="font-medium text-gray-900">
                    {selectedBVN.registrationDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Record Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedBVN.createdAt).toLocaleDateString()}
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
