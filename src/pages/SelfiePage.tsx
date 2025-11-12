import React, { useState, useEffect } from "react";
import { Card, Button, Alert } from "../components/ui";
import { selfieService, type SelfieRecord } from "../services";

export const SelfiePage: React.FC = () => {
  const [selfieRecords, setSelfieRecords] = useState<SelfieRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(100);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"userId" | "bvn">("bvn");

  // Fetch selfie records
  const fetchSelfieRecords = async (page: number, search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page,
        limit,
      };

      // Add search parameter based on search type
      if (search && search.trim()) {
        if (searchType === "userId") {
          params.userId = search.trim();
        } else {
          params.bvn = search.trim();
        }
      }

      const response = await selfieService.getAllRecords(params);
      setSelfieRecords(response.data.items);
      setCurrentPage(response.data.meta.page);
      setTotalPages(response.data.meta.totalPages);
      setTotalRecords(response.data.meta.total);
    } catch (error: unknown) {
      const axiosError = error as any;

      // Check for 401/403 errors - these should be handled by the interceptor
      // but we add this check to ensure proper handling
      if (
        axiosError.response?.status === 401 ||
        axiosError.response?.status === 403
      ) {
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
        "Failed to fetch selfie records. Please try again.";
      setError(errorMessage);
      setSelfieRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch records on component mount
  useEffect(() => {
    fetchSelfieRecords(1);
  }, []);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    fetchSelfieRecords(newPage, searchQuery);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchSelfieRecords(1, query); // Reset to page 1 when searching
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    fetchSelfieRecords(1); // Reset to page 1 and fetch all records
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selfie Verification
        </h1>
        <p className="text-gray-600 mt-1">
          Review and verify applicant selfies
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
      <Card title="Search Records" subtitle="Filter by User ID or BVN number">
        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-2">
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
          </div>
          <input
            type="text"
            placeholder={
              searchType === "userId"
                ? "Enter User ID..."
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
      </Card>

      {/* Selfie Grid */}
      <Card
        title="Selfie Records"
        subtitle={`Total: ${totalRecords.toLocaleString()} records`}
      >
        {loading && selfieRecords.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading selfie records...</p>
            </div>
          </div>
        ) : selfieRecords.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery.trim()
                ? `No records match "${searchQuery}". Try a different search.`
                : "No selfie records found"}
            </p>
          </div>
        ) : (
          <>
            {/* Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {selfieRecords.map((record) => (
                <div
                  key={record.id}
                  className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={record.image}
                      alt={`Selfie for BVN ${record.bvn}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/300?text=Image+Not+Found";
                      }}
                    />
                    {/* Overlay with scores */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm font-semibold">
                          Confidence: {record.response.confidence.toFixed(2)}%
                        </p>
                        <p className="text-sm font-semibold">
                          Similarity: {record.response.similarity.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BVN and Info */}
                  <div className="p-3 bg-white">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {record.bvn}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      User: {record.userId}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
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
    </div>
  );
};
