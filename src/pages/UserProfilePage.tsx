import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Alert, Modal } from "../components/ui";
import {
  userService,
  type UserProfile,
  type UserProfileDetails,
  type UserDocument,
  type UserSelfie,
  type UserBVNData,
  type PersonalCardAccount,
  type LoanAnalysisData,
} from "../services/userService";
import { creditApplicationService } from "../services/creditApplicationService";

// Image Modal Component for zoom functionality
const ImageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}> = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
        >
          ×
        </button>
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        <p className="text-white text-center mt-2">{title}</p>
      </div>
    </div>
  );
};

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // State for all user data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userProfileDetails, setUserProfileDetails] =
    useState<UserProfileDetails | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [selfies, setSelfies] = useState<UserSelfie[]>([]);
  const [bvnData, setBvnData] = useState<UserBVNData | null>(null);
  const [cardAccount, setCardAccount] = useState<PersonalCardAccount | null>(
    null
  );

  // Loan analysis data state
  const [loanAnalysisData, setLoanAnalysisData] =
    useState<LoanAnalysisData | null>(null);
  const [loanAnalysisLoading, setLoanAnalysisLoading] = useState(false);
  const [loanAnalysisError, setLoanAnalysisError] = useState<string | null>(
    null
  );

  // Main tab state (User Profile or Loan Analysis)
  const [activeMainTab, setActiveMainTab] = useState<
    "profile" | "loanAnalysis"
  >("profile");

  // Loan analysis tab state
  const [loanAnalysisTab, setLoanAnalysisTab] = useState<string>("decisions");

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Image modal state
  const [modalImage, setModalImage] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({
    isOpen: false,
    imageUrl: "",
    title: "",
  });

  const openImageModal = (imageUrl: string, title: string) => {
    setModalImage({ isOpen: true, imageUrl, title });
  };

  const closeImageModal = () => {
    setModalImage({ isOpen: false, imageUrl: "", title: "" });
  };

  // Action modal states
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReviewLimitModal, setShowReviewLimitModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);

  // Form states
  const [declineReason, setDeclineReason] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [reviewAction, setReviewAction] = useState<"increase" | "decrease">(
    "increase"
  );
  const [newLimit, setNewLimit] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");

  // Action loading and success states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch all user data in a single API call
  const fetchUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserCompleteDetails(userId);

      // Set all data from the single response
      setUserProfile(response.data.user);
      setUserProfileDetails(response.data.userProfile);
      setSelfies(response.data.selfieAttempts);
      setDocuments(response.data.documents);
      setCardAccount(response.data.personalCardAccounts);
      setBvnData(response.data.bvnData);
    } catch (error: any) {
      setError(error.message || "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch loan analysis data
  const fetchLoanAnalysisData = async () => {
    if (!userId) return;

    try {
      setLoanAnalysisLoading(true);
      setLoanAnalysisError(null);
      const response = await userService.getUserLoanAnalysis(userId);
      setLoanAnalysisData(response.data);
    } catch (error: any) {
      setLoanAnalysisError(
        error.message || "Failed to fetch loan analysis data"
      );
    } finally {
      setLoanAnalysisLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserData();
    fetchLoanAnalysisData();
  }, [userId]);

  // Handle approve user decision
  const handleApproveUser = () => {
    setActionSuccess(null);
    setActionError(null);
    setCreditLimit("");
    setShowApproveModal(true);
  };

  // Handle reject user decision
  const handleRejectUser = () => {
    setActionSuccess(null);
    setActionError(null);
    setDeclineReason("");
    setShowDeclineModal(true);
  };

  // Handle review user decision
  const handleReviewUser = () => {
    setActionSuccess(null);
    setActionError(null);
    setReviewAction("increase");
    setNewLimit("");
    setShowReviewLimitModal(true);
  };

  // Handle edit user name
  const handleEditUserName = () => {
    setActionSuccess(null);
    setActionError(null);
    setEditFirstName(userProfile?.name || "");
    setEditLastName(userProfile?.lastName || "");
    setShowEditNameModal(true);
  };

  // Submit decline application
  const handleSubmitDecline = async () => {
    if (!userId || !declineReason.trim()) {
      setActionError("Please provide a reason for declining");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await creditApplicationService.declineApplication(
        userId,
        declineReason.trim()
      );
      setActionSuccess("Application declined successfully");
      setShowDeclineModal(false);
      setDeclineReason("");
      // Refresh user data
      await fetchUserData();
    } catch (error: any) {
      setActionError(error.message || "Failed to decline application");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit approve application
  const handleSubmitApprove = async () => {
    if (!userId || !creditLimit.trim()) {
      setActionError("Please provide a credit limit");
      return;
    }

    const limitValue = parseFloat(creditLimit);
    if (isNaN(limitValue) || limitValue <= 0) {
      setActionError("Please provide a valid credit limit");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await creditApplicationService.approveApplication(userId, limitValue);
      setActionSuccess("Application approved successfully");
      setShowApproveModal(false);
      setCreditLimit("");
      // Refresh user data
      await fetchUserData();
    } catch (error: any) {
      setActionError(error.message || "Failed to approve application");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit review limit
  const handleSubmitReviewLimit = async () => {
    if (!userId || !newLimit.trim()) {
      setActionError("Please provide a new credit limit");
      return;
    }

    const limitValue = parseFloat(newLimit);
    if (isNaN(limitValue) || limitValue <= 0) {
      setActionError("Please provide a valid credit limit");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await creditApplicationService.reviewLimit(
        userId,
        reviewAction,
        limitValue
      );
      setActionSuccess(`Credit limit ${reviewAction}d successfully`);
      setShowReviewLimitModal(false);
      setNewLimit("");
      // Refresh user data
      await fetchUserData();
    } catch (error: any) {
      setActionError(error.message || "Failed to review credit limit");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit edit user name
  const handleSubmitEditName = async () => {
    if (!userId || !editFirstName.trim()) {
      setActionError("First name is required");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      await creditApplicationService.editUserName(
        userId,
        editFirstName.trim(),
        editLastName.trim() || undefined
      );
      setActionSuccess("User name updated successfully");
      setShowEditNameModal(false);
      setEditFirstName("");
      setEditLastName("");
      // Refresh user data
      await fetchUserData();
    } catch (error: any) {
      setActionError(error.message || "Failed to update user name");
    } finally {
      setActionLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid User ID
          </h1>
          <p className="text-gray-600 mb-6">No user ID provided in the URL.</p>
          <Button onClick={() => navigate("/applications")}>
            Back to Applications
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading User Profile
            </h2>
            <p className="text-gray-600">Fetching user data...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8">
          <Alert type="error" message={error} className="mb-6" />
          <div className="flex gap-4">
            <Button onClick={fetchUserData}>Retry</Button>
            <Button variant="outline" onClick={() => navigate("/applications")}>
              Back to Applications
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Alerts */}
        {actionSuccess && (
          <Alert
            type="success"
            message={actionSuccess}
            onClose={() => setActionSuccess(null)}
            className="mb-6"
          />
        )}
        {actionError && (
          <Alert
            type="error"
            message={actionError}
            onClose={() => setActionError(null)}
            className="mb-6"
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="outline"
                onClick={() => navigate("/applications")}
                className="mb-4"
              >
                ← Back to Applications
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                {userProfile
                  ? `${userProfile.name} ${userProfile.lastName}`
                  : `User ${userId}`}
              </h1>
              <p className="text-gray-600">User ID: {userId}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleEditUserName}
                className="bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100"
              >
                Edit Name
              </Button>
              <Button
                variant="outline"
                onClick={handleReviewUser}
                className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
              >
                Review Decision
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectUser}
                className="bg-red-50 border-red-200 text-red-800 hover:bg-red-100"
              >
                Reject User
              </Button>
              <Button
                onClick={handleApproveUser}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve User
              </Button>
            </div>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveMainTab("profile")}
                className={`${
                  activeMainTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                User Profile
              </button>
              <button
                onClick={() => setActiveMainTab("loanAnalysis")}
                className={`${
                  activeMainTab === "loanAnalysis"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Loan Analysis
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeMainTab === "profile" ? (
          /* User Profile Tab Content */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Content (2/3 width on xl screens) */}
            <div className="xl:col-span-2 space-y-8">
              {/* Profile Section */}
              <div>
                {userProfile && userProfileDetails ? (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                      User Profile
                    </h2>
                    <div className="space-y-4">
                      {/* Name Fields - Separate */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Name
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfile.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Last Name
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfile.lastName}
                        </span>
                      </div>

                      {/* Basic Information */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Email
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfile.email}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Phone Number
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfile.phoneNo}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          User ID
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfile.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Date of Birth
                        </span>
                        <span className="font-medium text-gray-900">
                          {new Date(
                            userProfileDetails.dateOfBirth
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          BVN
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfileDetails.bvn}
                        </span>
                      </div>

                      {/* Account Status */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Status
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userProfile.status === "processed"
                              ? "bg-green-100 text-green-800"
                              : userProfile.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {userProfile.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Blacklisted
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            userProfile.isBlacklisted
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {userProfile.isBlacklisted ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Source
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfile.source}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Operating System
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfile.operatingSystem}
                        </span>
                      </div>

                      {/* Address Information */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Address
                        </span>
                        <span className="font-medium text-gray-900 text-right max-w-md">
                          {userProfileDetails.address}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          State
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfileDetails.state}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          LGA
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfileDetails.lga}
                        </span>
                      </div>

                      {/* Employment Information */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Employer
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfileDetails.employer}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Employment Status
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfileDetails.employmentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Salary
                        </span>
                        <span className="font-medium text-gray-900">
                          ₦
                          {parseInt(userProfileDetails.salary).toLocaleString()}
                        </span>
                      </div>

                      {/* Financial Information */}
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Credit Limit
                        </span>
                        <span className="font-medium text-gray-900">
                          ₦{userProfileDetails.creditLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Standard Loan Limit
                        </span>
                        <span className="font-medium text-gray-900">
                          ₦
                          {userProfileDetails.standardLoanLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Interest Rate
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfileDetails.standardLoanInterestRate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-sm font-medium text-gray-600">
                          Referral Code
                        </span>
                        <span className="font-medium text-gray-900">
                          {userProfileDetails.referralCode}
                        </span>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <p className="text-gray-500 text-center">
                      No profile data available
                    </p>
                  </Card>
                )}
              </div>

              {/* BVN Data Section */}
              <div>
                {bvnData ? (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        BVN Information
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          bvnData.watchlisted
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {bvnData.watchlisted ? "Watchlisted" : "Clear"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bvnData.photoUrl && (
                        <div className="md:col-span-1">
                          <p className="text-sm text-gray-600 mb-2">
                            BVN Photo
                          </p>
                          <div className="w-32 h-32 overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                            <img
                              src={bvnData.photoUrl}
                              alt="BVN Photo"
                              className="w-full h-full object-cover"
                              onClick={() => {
                                if (
                                  bvnData.photoUrl &&
                                  bvnData.photoUrl !== "/placeholder-image.png"
                                ) {
                                  openImageModal(bvnData.photoUrl, "BVN Photo");
                                }
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder-image.png";
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600">BVN Number</p>
                          <p className="font-medium text-gray-900">
                            {bvnData.bvn}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-medium text-gray-900">
                            {bvnData.firstName} {bvnData.middleName}{" "}
                            {bvnData.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date of Birth</p>
                          <p className="font-medium text-gray-900">
                            {new Date(bvnData.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium text-gray-900">
                            {bvnData.phoneNumber1}
                          </p>
                        </div>
                        {bvnData.email && (
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">
                              {bvnData.email}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Gender</p>
                          <p className="font-medium text-gray-900">
                            {bvnData.gender}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            State of Origin
                          </p>
                          <p className="font-medium text-gray-900">
                            {bvnData.stateOfOrigin}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">LGA of Origin</p>
                          <p className="font-medium text-gray-900">
                            {bvnData.lgaOfOrigin}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Marital Status
                          </p>
                          <p className="font-medium text-gray-900">
                            {bvnData.maritalStatus}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <p className="text-gray-500 text-center">
                      No BVN data available
                    </p>
                  </Card>
                )}
              </div>

              {/* Selfies Section */}
              <div>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                    Selfies ({selfies.length})
                  </h2>
                  {selfies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {selfies.map((selfie) => (
                        <Card key={selfie.id} className="p-4">
                          <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                            <img
                              src={selfie.image || "/placeholder-image.png"}
                              alt="User Selfie"
                              className="w-full h-full object-cover"
                              onClick={() => {
                                if (
                                  selfie.image &&
                                  selfie.image !== "/placeholder-image.png"
                                ) {
                                  openImageModal(
                                    selfie.image,
                                    `Selfie #${selfie.id}`
                                  );
                                }
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder-image.png";
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Confidence
                              </span>
                              <span className="font-medium text-gray-900">
                                {selfie.response?.confidence
                                  ? selfie.response.confidence.toFixed(1)
                                  : "N/A"}
                                %
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Similarity
                              </span>
                              <span className="font-medium text-gray-900">
                                {selfie.response?.similarity
                                  ? selfie.response.similarity.toFixed(1)
                                  : "N/A"}
                                %
                              </span>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600">Captured</p>
                              <p className="text-xs text-gray-500">
                                {new Date(selfie.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No selfies available</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Documents Section */}
              <div>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                    Documents ({documents.length})
                  </h2>
                  {documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {documents.map((doc) => (
                        <Card key={doc.id} className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {doc.type}
                            </h3>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Document
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm text-gray-600">File Name</p>
                              <p className="font-medium text-gray-900">
                                {doc.filename}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Type</p>
                              <p className="font-medium text-gray-900">
                                {doc.type}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Uploaded</p>
                              <p className="font-medium text-gray-900">
                                {new Date(doc.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {doc.comments && (
                              <div>
                                <p className="text-sm text-gray-600">
                                  Comments
                                </p>
                                <p className="font-medium text-gray-900">
                                  {doc.comments}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (doc.url) {
                                  window.open(doc.url, "_blank");
                                } else {
                                  alert("Document URL not available");
                                }
                              }}
                              className="w-full"
                              disabled={!doc.url}
                            >
                              View Document
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No documents available</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Card Account Section */}
              <div>
                {cardAccount ? (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Personal Card Account
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-medium text-gray-900">
                          {cardAccount.accountNo}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Available Balance
                        </p>
                        <p className="font-medium text-gray-900">
                          ₦{cardAccount.availableBalance.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">BNPL Balance</p>
                        <p className="font-medium text-gray-900">
                          ₦{cardAccount.bnplBalance.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Credit Card Limit
                        </p>
                        <p className="font-medium text-gray-900">
                          ₦{cardAccount.creditCardLimit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Available Credit
                        </p>
                        <p className="font-medium text-gray-900">
                          ₦{cardAccount.availableCredit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Repayment Percentage
                        </p>
                        <p className="font-medium text-gray-900">
                          {cardAccount.repaymentPercentage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">PIN Status</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            cardAccount.pinStatus === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cardAccount.pinStatus}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Freemium</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            cardAccount.freemium
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {cardAccount.freemium ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Mandate Status</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            cardAccount.mandateStatus === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cardAccount.mandateStatus}
                        </span>
                      </div>
                      {cardAccount.freemiumExpireDate && (
                        <div>
                          <p className="text-sm text-gray-600">
                            Freemium Expires
                          </p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              cardAccount.freemiumExpireDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <p className="text-gray-500 text-center">
                      No card account available
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Loan Analysis Tab Content */
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-3">
                Loan Analysis
              </h2>

              {loanAnalysisError && (
                <Alert type="error" message={loanAnalysisError} />
              )}

              {loanAnalysisLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading loan analysis data...</p>
                </div>
              ) : loanAnalysisData ? (
                <div>
                  {/* Tab Navigation */}
                  <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                    {[
                      {
                        id: "decisions",
                        label: `Decisions (${loanAnalysisData.decisions.length})`,
                      },
                      {
                        id: "statements",
                        label: `Statements (${loanAnalysisData.statements.length})`,
                      },
                      { id: "creditReport", label: "Credit Report" },
                      {
                        id: "score",
                        label: `Scores (${loanAnalysisData.creditScores.length})`,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setLoanAnalysisTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          loanAnalysisTab === tab.id
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  {loanAnalysisTab === "decisions" && (
                    <div className="space-y-4">
                      {loanAnalysisData.decisions.length > 0 ? (
                        loanAnalysisData.decisions.map((decision) => (
                          <Card key={decision.id} className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {decision.decisionType
                                  .replace(/_/g, " ")
                                  .toUpperCase()}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  decision.loanBotStatus === "auto_approved"
                                    ? "bg-green-100 text-green-800"
                                    : decision.loanBotStatus === "auto_rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {decision.loanBotStatus
                                  .replace(/_/g, " ")
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Decision Source
                                </p>
                                <p className="font-medium text-gray-900">
                                  {decision.decisionSource
                                    .replace(/_/g, " ")
                                    .toUpperCase()}
                                </p>
                              </div>
                              {decision.approvedAmount && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Approved Amount
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    ₦
                                    {parseFloat(
                                      decision.approvedAmount
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {decision.recommendedLimit && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Recommended Limit
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    ₦
                                    {parseFloat(
                                      decision.recommendedLimit
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {decision.calcMonthlyIncome && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Monthly Income
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    ₦
                                    {parseFloat(
                                      decision.calcMonthlyIncome
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {decision.accountHolder && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Account Holder
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {decision.accountHolder}
                                  </p>
                                </div>
                              )}
                              {decision.accountNumber && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Account Number
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {decision.accountNumber}
                                  </p>
                                </div>
                              )}
                              {decision.reportedSalary && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Reported Salary
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    ₦
                                    {parseFloat(
                                      decision.reportedSalary
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {decision.employmentType && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Employment Type
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {decision.employmentType
                                      .replace(/_/g, " ")
                                      .toUpperCase()}
                                  </p>
                                </div>
                              )}
                              {decision.creditCardLimit && (
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Credit Card Limit
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    ₦
                                    {parseFloat(
                                      decision.creditCardLimit
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                            {decision.creditAnalysis && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-md font-semibold text-gray-900 mb-2">
                                  Credit Analysis
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Total Loans
                                    </p>
                                    <p className="font-medium text-gray-900">
                                      {decision.creditAnalysis.totalLoansCount}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Closed Loans
                                    </p>
                                    <p className="font-medium text-gray-900">
                                      {decision.creditAnalysis.closedLoansCount}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Performing Loans
                                    </p>
                                    <p className="font-medium text-gray-900">
                                      {
                                        decision.creditAnalysis
                                          .performingLoansCount
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Non-Performing
                                    </p>
                                    <p className="font-medium text-gray-900">
                                      {decision.creditAnalysis
                                        .hasNonPerformingLoans
                                        ? "Yes"
                                        : "No"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No decisions available
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {loanAnalysisTab === "statements" && (
                    <div>
                      {loanAnalysisData.statements.length > 0 ? (
                        <div className="space-y-4">
                          {loanAnalysisData.statements.map((statement: any) => (
                            <Card key={statement.id} className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {statement.name}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {statement.bankName} -{" "}
                                    {statement.accountType}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    window.open(
                                      `http://172.16.0.17:75?statementId=${statement.id}`,
                                      "_blank"
                                    );
                                  }}
                                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                >
                                  View Statement
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Account Number
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {statement.nuban}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Period
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {statement.period}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Total Credit
                                  </p>
                                  <p className="text-sm font-medium text-green-600">
                                    ₦
                                    {parseFloat(
                                      statement.totalCredit || 0
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Total Debit
                                  </p>
                                  <p className="text-sm font-medium text-red-600">
                                    ₦
                                    {parseFloat(
                                      statement.totalDebit || 0
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Available Balance
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">
                                    ₦
                                    {parseFloat(
                                      statement.availableBal || 0
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Book Balance
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">
                                    ₦
                                    {parseFloat(
                                      statement.bookBal || 0
                                    ).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Status
                                  </p>
                                  <p className="text-sm font-medium">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        statement.status === "00"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {statement.status === "00"
                                        ? "Success"
                                        : statement.status}
                                    </span>
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Transactions
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {statement.transactions?.length || 0}{" "}
                                    transactions
                                  </p>
                                </div>
                              </div>

                              {statement.verificationStatus && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <p className="text-xs text-gray-500">
                                    Verification Status
                                  </p>
                                  <p className="text-sm font-medium">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        statement.verificationStatus ===
                                        "verified"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {statement.verificationStatus}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No statements available
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {loanAnalysisTab === "creditReport" && (
                    <div>
                      {loanAnalysisData.creditReport ? (
                        <div className="space-y-6">
                          {/* Personal Information */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium text-gray-900">
                                  {loanAnalysisData.creditReport.name}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Gender</p>
                                <p className="font-medium text-gray-900">
                                  {loanAnalysisData.creditReport.gender}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  Date of Birth
                                </p>
                                <p className="font-medium text-gray-900">
                                  {loanAnalysisData.creditReport.dateOfBirth}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">BVN</p>
                                <p className="font-medium text-gray-900">
                                  {loanAnalysisData.creditReport.bvn}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium text-gray-900">
                                  {loanAnalysisData.creditReport.phone}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium text-gray-900">
                                  {loanAnalysisData.creditReport.email || "N/A"}
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="font-medium text-gray-900">
                                  {loanAnalysisData.creditReport.address}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Credit Metrics */}
                          {loanAnalysisData.creditReport.scores.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Credit Analysis
                              </h3>
                              {loanAnalysisData.creditReport.scores.map(
                                (score) => (
                                  <div
                                    key={score.id}
                                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                                  >
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-blue-600">
                                        Total Loans
                                      </p>
                                      <p className="text-2xl font-bold text-blue-900">
                                        {score.totalNoOfLoans}
                                      </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                      <p className="text-sm text-green-600">
                                        Active Loans
                                      </p>
                                      <p className="text-2xl font-bold text-green-900">
                                        {score.totalNoOfActiveLoans}
                                      </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600">
                                        Closed Loans
                                      </p>
                                      <p className="text-2xl font-bold text-gray-900">
                                        {score.totalNoOfClosedLoans}
                                      </p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                      <p className="text-sm text-red-600">
                                        Delinquent Facilities
                                      </p>
                                      <p className="text-2xl font-bold text-red-900">
                                        {score.totalNoOfDelinquentFacilities}
                                      </p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                      <p className="text-sm text-purple-600">
                                        Total Borrowed
                                      </p>
                                      <p className="text-2xl font-bold text-purple-900">
                                        ₦{score.totalBorrowed.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                      <p className="text-sm text-orange-600">
                                        Total Outstanding
                                      </p>
                                      <p className="text-2xl font-bold text-orange-900">
                                        ₦
                                        {score.totalOutstanding.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                      <p className="text-sm text-yellow-600">
                                        Total Overdue
                                      </p>
                                      <p className="text-2xl font-bold text-yellow-900">
                                        ₦{score.totalOverdue.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="bg-indigo-50 p-4 rounded-lg">
                                      <p className="text-sm text-indigo-600">
                                        Highest Loan
                                      </p>
                                      <p className="text-2xl font-bold text-indigo-900">
                                        ₦
                                        {score.highestLoanAmount.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="bg-pink-50 p-4 rounded-lg">
                                      <p className="text-sm text-pink-600">
                                        Monthly Installment
                                      </p>
                                      <p className="text-2xl font-bold text-pink-900">
                                        ₦
                                        {score.totalMonthlyInstallment.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="bg-teal-50 p-4 rounded-lg">
                                      <p className="text-sm text-teal-600">
                                        Institutions
                                      </p>
                                      <p className="text-2xl font-bold text-teal-900">
                                        {score.totalNoOfInstitutions}
                                      </p>
                                    </div>
                                    <div className="bg-cyan-50 p-4 rounded-lg">
                                      <p className="text-sm text-cyan-600">
                                        Performing Loans
                                      </p>
                                      <p className="text-2xl font-bold text-cyan-900">
                                        {score.totalNoOfPerformingLoans}
                                      </p>
                                    </div>
                                    <div className="bg-rose-50 p-4 rounded-lg">
                                      <p className="text-sm text-rose-600">
                                        Overdue Accounts
                                      </p>
                                      <p className="text-2xl font-bold text-rose-900">
                                        {score.totalNoOfOverdueAccounts}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No credit report available
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {loanAnalysisTab === "score" && (
                    <div>
                      {loanAnalysisData.creditScores.length > 0 ? (
                        <div className="space-y-6">
                          {loanAnalysisData.creditScores.map((score) => (
                            <Card key={score.id} className="p-6">
                              <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  Credit Score Report
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Updated:{" "}
                                  {new Date(
                                    score.updatedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>

                              {/* Loan Performances */}
                              {score.loanPerformances.length > 0 && (
                                <div>
                                  <h4 className="text-md font-semibold text-gray-900 mb-4">
                                    Loan Performance History (
                                    {score.loanPerformances.length} loans)
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Lender
                                          </th>
                                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Account
                                          </th>
                                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loan Amount
                                          </th>
                                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Outstanding
                                          </th>
                                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Overdue
                                          </th>
                                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Performance
                                          </th>
                                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {score.loanPerformances.map((loan) => (
                                          <tr key={loan.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                              {loan.loanProvider}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                              {loan.accountNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                              ₦
                                              {loan.loanAmount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                              ₦
                                              {loan.outstandingBalance.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                              <span
                                                className={
                                                  loan.overdueAmount > 0
                                                    ? "text-red-600 font-medium"
                                                    : "text-gray-900"
                                                }
                                              >
                                                ₦
                                                {loan.overdueAmount.toLocaleString()}
                                              </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                              <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                  loan.performanceStatus ===
                                                  "Performing"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                              >
                                                {loan.performanceStatus}
                                              </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                              <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                  loan.status === "Closed"
                                                    ? "bg-gray-100 text-gray-800"
                                                    : "bg-blue-100 text-blue-800"
                                                }`}
                                              >
                                                {loan.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Summary Stats */}
                                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                      <p className="text-sm text-green-600">
                                        Performing Loans
                                      </p>
                                      <p className="text-xl font-bold text-green-900">
                                        {
                                          score.loanPerformances.filter(
                                            (l) =>
                                              l.performanceStatus ===
                                              "Performing"
                                          ).length
                                        }
                                      </p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                      <p className="text-sm text-red-600">
                                        Non-Performing
                                      </p>
                                      <p className="text-xl font-bold text-red-900">
                                        {
                                          score.loanPerformances.filter(
                                            (l) =>
                                              l.performanceStatus ===
                                              "Not Performing"
                                          ).length
                                        }
                                      </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                      <p className="text-sm text-blue-600">
                                        Open Loans
                                      </p>
                                      <p className="text-xl font-bold text-blue-900">
                                        {
                                          score.loanPerformances.filter(
                                            (l) => l.status === "Open"
                                          ).length
                                        }
                                      </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <p className="text-sm text-gray-600">
                                        Closed Loans
                                      </p>
                                      <p className="text-xl font-bold text-gray-900">
                                        {
                                          score.loanPerformances.filter(
                                            (l) => l.status === "Closed"
                                          ).length
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">
                            No credit scores available
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No loan analysis data available
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalImage.isOpen}
        onClose={closeImageModal}
        imageUrl={modalImage.imageUrl}
        title={modalImage.title}
      />

      {/* Decline Application Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => {
          setShowDeclineModal(false);
          setDeclineReason("");
          setActionError(null);
        }}
        title="Decline Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for declining this application:
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Decline <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              placeholder="Enter the reason for declining..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              disabled={actionLoading}
            />
          </div>

          {actionError && (
            <Alert
              type="error"
              message={actionError}
              onClose={() => setActionError(null)}
            />
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeclineModal(false);
                setDeclineReason("");
                setActionError(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmitDecline}
              disabled={actionLoading || !declineReason.trim()}
              isLoading={actionLoading}
            >
              Decline Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Application Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setCreditLimit("");
          setActionError(null);
        }}
        title="Approve Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please set the credit limit for this user:
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Limit (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter credit limit amount..."
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              disabled={actionLoading}
              min="0"
              step="1000"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the maximum credit limit for this user
            </p>
          </div>

          {actionError && (
            <Alert
              type="error"
              message={actionError}
              onClose={() => setActionError(null)}
            />
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowApproveModal(false);
                setCreditLimit("");
                setActionError(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSubmitApprove}
              disabled={actionLoading || !creditLimit.trim()}
              isLoading={actionLoading}
            >
              Approve Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Credit Limit Modal */}
      <Modal
        isOpen={showReviewLimitModal}
        onClose={() => {
          setShowReviewLimitModal(false);
          setNewLimit("");
          setReviewAction("increase");
          setActionError(null);
        }}
        title="Review Credit Limit"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Adjust the user's credit limit:</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="reviewAction"
                  value="increase"
                  checked={reviewAction === "increase"}
                  onChange={(e) =>
                    setReviewAction(e.target.value as "increase" | "decrease")
                  }
                  disabled={actionLoading}
                  className="mr-2"
                />
                <span className="text-gray-700">Increase Limit</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="reviewAction"
                  value="decrease"
                  checked={reviewAction === "decrease"}
                  onChange={(e) =>
                    setReviewAction(e.target.value as "increase" | "decrease")
                  }
                  disabled={actionLoading}
                  className="mr-2"
                />
                <span className="text-gray-700">Decrease Limit</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Credit Limit (₦) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter new credit limit..."
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              disabled={actionLoading}
              min="0"
              step="1000"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the new credit limit amount
            </p>
          </div>

          {actionError && (
            <Alert
              type="error"
              message={actionError}
              onClose={() => setActionError(null)}
            />
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowReviewLimitModal(false);
                setNewLimit("");
                setReviewAction("increase");
                setActionError(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleSubmitReviewLimit}
              disabled={actionLoading || !newLimit.trim()}
              isLoading={actionLoading}
              className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
            >
              Update Credit Limit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Name Modal */}
      <Modal
        isOpen={showEditNameModal}
        onClose={() => {
          setShowEditNameModal(false);
          setEditFirstName("");
          setEditLastName("");
          setActionError(null);
        }}
        title="Edit User Name"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Update the user's first name and last name:
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter first name..."
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter last name (optional)..."
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              disabled={actionLoading}
            />
          </div>

          {actionError && (
            <Alert
              type="error"
              message={actionError}
              onClose={() => setActionError(null)}
            />
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditNameModal(false);
                setEditFirstName("");
                setEditLastName("");
                setActionError(null);
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitEditName}
              disabled={actionLoading || !editFirstName.trim()}
              isLoading={actionLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Update Name
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
