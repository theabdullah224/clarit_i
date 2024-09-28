// components/PatientList.tsx

"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import { File, Trash2 } from "lucide-react";
import { useToast } from "@/app/components/ui/use-toast";
import UploadLabResultModal from "./UploadResultsModal";
import ReportList from "./ReportList";


interface Report {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface LabResult {
  id: string;
  extractedText: string;
  uploadedAt: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  reports: Report[];
  labResults: LabResult[];
}

interface PatientListProps {
  patients: Patient[];
  onPatientDeleted: (patientId: string) => void;
  onLabResultUploaded: (patientId: string, labResult: LabResult) => void;
  onReportAdded: (patientId: string, report: Report) => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  onPatientDeleted,
  onLabResultUploaded,
  onReportAdded,
}) => {
  const { toast } = useToast();

  const handleDelete = async (patientId: string) => {
    if (!confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/facility/delete-patient/${patientId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete patient");
      }

      onPatientDeleted(patientId);

      toast({
        title: "Success",
        description: "Patient deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the patient.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {patients.map((patient) => (
        <div key={patient.id} className="border rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{patient.name}</h3>
              <p className="text-sm text-gray-600">{patient.email}</p>
              {patient.phone && <p className="text-sm text-gray-600">Phone: {patient.phone}</p>}
            </div>
            <div className="flex space-x-2">
              <UploadLabResultModal
                patient={patient}
                onLabResultUploaded={onLabResultUploaded}
                onReportAdded={onReportAdded}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(patient.id)}
                className="flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete user</span>
              </Button>
            </div>
          </div>

          {/* Display Reports */}
          <ReportList patientId={patient.id}  />
        </div>
      ))}
    </div>
  );
};

export default PatientList;
