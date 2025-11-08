import React, { useState, useEffect } from "react";
import { Card, Alert } from "../components/ui";
import { creditApplicationService, type CreditApplication } from "../services";

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState([
    {
      label: "Total Applications",
      value: 0,
      change: "Loading...",
      trend: "up" as const,
      icon: "📋",
    },
    {
      label: "Pending Review",
      value: 0,
      change: "Loading...",
      trend: "up" as const,
      icon: "⏳",
    },
    {
      label: "Approved",
      value: 0,
      change: "Loading...",
      trend: "up" as const,
      icon: "✅",
    },
    {
      label: "Rejected",
      value: 0,
      change: "Loading...",
      trend: "down" as const,
      icon: "❌",
    },
  ]);

  const [recentApplications, setRecentApplications] = useState<
    CreditApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all applications (first page with high limit to get stats)
        const response = await creditApplicationService.getAllApplications({
          page: 1,
          limit: 1000,
        });

        const applications = response.data.items;
        const total = response.data.meta.total;

        // Calculate statistics
        const pending = applications.filter(
          (app) => app.creditReportStatus === "pending"
        ).length;
        const approved = applications.filter(
          (app) => app.creditReportStatus === "approved"
        ).length;
        const rejected = applications.filter(
          (app) => app.creditReportStatus === "not_approved"
        ).length;

        // Calculate rejection rate
        const rejectionRate =
          total > 0 ? Math.round((rejected / total) * 100) : 0;

        // Update stats
        setStats([
          {
            label: "Total Applications",
            value: total,
            change: `${total.toLocaleString()} total`,
            trend: "up" as const,
            icon: "📋",
          },
          {
            label: "Pending Review",
            value: pending,
            change: `${((pending / total) * 100).toFixed(1)}% of total`,
            trend: "up" as const,
            icon: "⏳",
          },
          {
            label: "Approved",
            value: approved,
            change: `${((approved / total) * 100).toFixed(1)}% of total`,
            trend: "up" as const,
            icon: "✅",
          },
          {
            label: "Rejected",
            value: rejected,
            change: `${rejectionRate}% rejection rate`,
            trend: "down" as const,
            icon: "❌",
          },
        ]);

        // Get recent applications (first 5)
        const recent = await creditApplicationService.getAllApplications({
          page: 1,
          limit: 5,
        });
        setRecentApplications(recent.data.items);
      } catch (error: unknown) {
        console.error("Failed to fetch dashboard data:", error);
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
          "Failed to load dashboard data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's your overview.
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    stat.value
                  )}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    stat.trend === "up" ? "text-success-600" : "text-danger-600"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      <Card title="Recent Applications" padding="none">
        {loading && recentApplications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading applications...</p>
            </div>
          </div>
        ) : recentApplications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No recent applications found</p>
          </div>
        ) : (
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
                    Credit Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank Statement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplications.map((app) => (
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
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          app.creditReportStatus
                        )}`}
                      >
                        {formatStatus(app.creditReportStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          app.bankStatementStatus
                        )}`}
                      >
                        {formatStatus(app.bankStatementStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
