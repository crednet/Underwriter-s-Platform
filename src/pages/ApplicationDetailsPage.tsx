import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Modal } from "../components/ui";

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reasoning, setReasoning] = useState("");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Details
          </h1>
          <p className="text-gray-600 mt-1">Application ID: {id}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="danger"
            onClick={() => {
              setDecision("REJECT");
              setShowDecisionModal(true);
            }}
          >
            Reject
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setDecision("APPROVE");
              setShowDecisionModal(true);
            }}
          >
            Approve
          </Button>
        </div>
      </div>

      {/* Applicant Information */}
      <Card title="Applicant Information">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="font-medium">Loading...</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">Loading...</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone Number</p>
            <p className="font-medium">Loading...</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">BVN</p>
            <p className="font-medium">Loading...</p>
          </div>
        </div>
      </Card>

      {/* Loan Details */}
      <Card title="Loan Details">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Requested Amount</p>
            <p className="font-medium">Loading...</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tenure</p>
            <p className="font-medium">Loading...</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Purpose</p>
            <p className="font-medium">Loading...</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Income</p>
            <p className="font-medium">Loading...</p>
          </div>
        </div>
      </Card>

      {/* Credit Report */}
      <Card title="Credit Report">
        <p className="text-gray-500">
          Credit report data will be displayed here
        </p>
      </Card>

      {/* Bank Statement Analysis */}
      <Card title="Bank Statement Analysis">
        <p className="text-gray-500">
          Bank statement analysis will be displayed here
        </p>
      </Card>

      {/* Decision Modal */}
      <Modal
        isOpen={showDecisionModal}
        onClose={() => setShowDecisionModal(false)}
        title={`${decision === "APPROVE" ? "Approve" : "Reject"} Application`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide your reasoning for this decision:
          </p>

          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
            placeholder="Enter your reasoning..."
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
          />

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDecisionModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={decision === "APPROVE" ? "success" : "danger"}
              onClick={() => {
                // TODO: Submit decision
                console.log("Decision:", decision, "Reasoning:", reasoning);
                setShowDecisionModal(false);
              }}
            >
              Confirm {decision === "APPROVE" ? "Approval" : "Rejection"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
