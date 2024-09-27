// components/FacilityDashboard.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import AddPatientModal from "./AddPatientModal";
import PatientList from "./PatientList";


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

const FacilityDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/facility/fetch-patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch patients");
      }

      const data = await response.json();
      setPatients(data.patients);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while fetching patients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handlePatientAdded = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handlePatientDeleted = (deletedPatientId: string) => {
    setPatients((prev) => prev.filter((patient) => patient.id !== deletedPatientId));
  };

  const handleLabResultUploaded = (patientId: string, newLabResult: LabResult) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId
          ? { ...patient, labResults: [newLabResult, ...patient.labResults] }
          : patient
      )
    );
  };

  const handleReportAdded = (patientId: string, newReport: Report) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId
          ? { ...patient, reports: [newReport, ...patient.reports] }
          : patient
      )
    );
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AddPatientModal onPatientAdded={handlePatientAdded} />
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="loader"></div>
        </div>
      ) : (
        <PatientList
          patients={patients}
          onPatientDeleted={handlePatientDeleted}
          onLabResultUploaded={handleLabResultUploaded}
          onReportAdded={handleReportAdded}
        />
      )}
    </div>
  );
};

export default FacilityDashboard;
