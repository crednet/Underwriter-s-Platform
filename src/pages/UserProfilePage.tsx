import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Alert } from "../components/ui";
import {
  userService,
  type UserProfile,
  type UserProfileDetails,
  type UserDocument,
  type UserSelfie,
  type UserBVNData,
  type PersonalCardAccount,
} from "../services/userService";

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

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>("profile");

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
      console.error("Failed to fetch user data:", error);
      setError(error.message || "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle approve user decision
  const handleApproveUser = () => {
    // TODO: Implement approve user logic
    console.log("Approve user:", userId);
  };

  // Handle reject user decision
  const handleRejectUser = () => {
    // TODO: Implement reject user logic
    console.log("Reject user:", userId);
  };

  // Handle review user decision
  const handleReviewUser = () => {
    // TODO: Implement review user logic
    console.log("Review user:", userId);
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

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "profile", label: "Profile", count: userProfile ? 1 : 0 },
              { id: "documents", label: "Documents", count: documents.length },
              { id: "selfies", label: "Selfies", count: selfies.length },
              { id: "bvn", label: "BVN Data", count: bvnData ? 1 : 0 },
              {
                id: "card-account",
                label: "Card Account",
                count: cardAccount ? 1 : 0,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              {userProfile && userProfileDetails ? (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    User Profile
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-900">
                        {userProfile.name} {userProfile.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">
                        {userProfile.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium text-gray-900">
                        {userProfile.phoneNo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-medium text-gray-900">
                        {userProfile.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Source</p>
                      <p className="font-medium text-gray-900">
                        {userProfile.source}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium text-gray-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            userProfile.status === "processed"
                              ? "bg-green-100 text-green-800"
                              : userProfile.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {userProfile.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Operating System</p>
                      <p className="font-medium text-gray-900">
                        {userProfile.operatingSystem}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blacklisted</p>
                      <p className="font-medium text-gray-900">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            userProfile.isBlacklisted
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {userProfile.isBlacklisted ? "Yes" : "No"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* User Profile Details Section */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Profile Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Date of Birth</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            userProfileDetails.dateOfBirth
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">BVN</p>
                        <p className="font-medium text-gray-900">
                          {userProfileDetails.bvn}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-900">
                          {userProfileDetails.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">State</p>
                        <p className="font-medium text-gray-900">
                          {userProfileDetails.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">LGA</p>
                        <p className="font-medium text-gray-900">
                          {userProfileDetails.lga}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Employer</p>
                        <p className="font-medium text-gray-900">
                          {userProfileDetails.employer}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Employment Status
                        </p>
                        <p className="font-medium text-gray-900">
                          {userProfileDetails.employmentStatus}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Salary</p>
                        <p className="font-medium text-gray-900">
                          ₦
                          {parseInt(userProfileDetails.salary).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Credit Limit</p>
                        <p className="font-medium text-gray-900">
                          ₦{userProfileDetails.creditLimit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Standard Loan Limit
                        </p>
                        <p className="font-medium text-gray-900">
                          ₦
                          {userProfileDetails.standardLoanLimit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Interest Rate</p>
                        <p className="font-medium text-gray-900">
                          {userProfileDetails.standardLoanInterestRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Referral Code</p>
                        <p className="font-medium text-gray-900">
                          {userProfileDetails.referralCode}
                        </p>
                      </div>
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
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div>
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
                            <p className="text-sm text-gray-600">Comments</p>
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
                <Card className="p-6">
                  <p className="text-gray-500 text-center">
                    No documents available
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* Selfies Tab */}
          {activeTab === "selfies" && (
            <div>
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
                              ? (selfie.response.confidence * 100).toFixed(1)
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
                              ? (selfie.response.similarity * 100).toFixed(1)
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
                <Card className="p-6">
                  <p className="text-gray-500 text-center">
                    No selfies available
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* BVN Data Tab */}
          {activeTab === "bvn" && (
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
                        <p className="text-sm text-gray-600 mb-2">BVN Photo</p>
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
                        <p className="text-sm text-gray-600">State of Origin</p>
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
                        <p className="text-sm text-gray-600">Marital Status</p>
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
          )}

          {/* Card Account Tab */}
          {activeTab === "card-account" && (
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
                      <p className="text-sm text-gray-600">Available Balance</p>
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
                      <p className="text-sm text-gray-600">Credit Card Limit</p>
                      <p className="font-medium text-gray-900">
                        ₦{cardAccount.creditCardLimit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Available Credit</p>
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
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalImage.isOpen}
        onClose={closeImageModal}
        imageUrl={modalImage.imageUrl}
        title={modalImage.title}
      />
    </div>
  );
};
