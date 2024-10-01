// components/ReportList.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { File, FileText } from "lucide-react";
import { useToast } from "@/app/components/ui/use-toast";
import { Progress } from "@/app/components/ui/progress";

interface Report {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface ReportListProps {
  patientId: string;
}

const ReportList: React.FC<ReportListProps> = ({ patientId }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<{[key: string]: boolean;}>({});
  const [isSendingEmail, setIsSendingEmail] = useState<{[key: string]: boolean;}>({});
  const [isDeletingReport, setIsDeletingReport] = useState<{[key: string]: boolean;}>({});
  const [isViewingPDF, setIsViewingPDF] = useState<{ [key: string]: boolean }>({});
  const [emailButtonLabel, setEmailButtonLabel] = useState<{ [key: string]: string }>({});


  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/facility/fetch-reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch reports");
        }

        const data = await response.json();
        setReports(data.reports);
      } catch (error: any) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description:
            error.message || "An error occurred while fetching reports.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [patientId, toast]);

  const handleDownload = async (reportId: string, reportTitle: string) => {
    setIsDownloading((prev) => ({ ...prev, [reportId]: true }));
    try {
      const response = await fetch("/api/facility/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      const data = await response.json();
      const { pdf } = data;

      // Convert base64 to Blob
      const pdfBlob = base64ToBlob(pdf, "application/pdf");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Create a link and trigger download
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${reportTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while downloading the PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64: string, type: string) => {
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }
    return new Blob([buffer], { type });
  };

  if (isLoading) {
    return <Progress className="h-1 w-full bg-zinc-200" />;
  }

  if (reports.length === 0) {
    return <p className="text-center text-gray-500">No reports available.</p>;
  }

  const handleSendEmail = async (reportId: string, reportTitle: string) => {
    try {
      setIsSendingEmail((prev) => ({ ...prev, [reportId]: true }));
      setEmailButtonLabel((prev) => ({ ...prev, [reportId]: "Sending to mail" }));
      // Generate the PDF
      const pdfResponse = await fetch("/api/facility/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      if (!pdfResponse.ok) {
        const errorData = await pdfResponse.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      const { pdf } = await pdfResponse.json();

      console.log({ reportId, pdf, reportTitle }); // Log to check the values before sending the email

      // Send the PDF via email
      const emailResponse = await fetch("/api/facility/send-patient-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, pdf, reportTitle }),
      });
      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.message || "Failed to send PDF to email");
      }

      toast({
        title: "Success",
        description: "PDF sent to patient's email successfully",
      });
    } catch (error) {
      console.error("Error sending PDF to email:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while sending the PDF to email",
        variant: "destructive",
      });
    } finally {
      setEmailButtonLabel((prev) => ({ ...prev, [reportId]: "Done!" }));
      setTimeout(() => {
        setEmailButtonLabel((prev) => ({ ...prev, [reportId]: "Send to email" }));
      }, 2000);
      setIsSendingEmail((prev) => ({ ...prev, [reportId]: false })); // Set loading state to false
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      setIsDeletingReport((prev) => ({ ...prev, [reportId]: true }));
      const response = await fetch(`/api/facility/delete-report/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete report");
      }
      setReports((prevReports) => {
        const updatedReports = prevReports.filter((report) => report.id !== reportId);
        
        return updatedReports;
      });

      toast({
        title: "Success",
        description: "Report deleted successfully",
      });

      // Optionally refresh the list of reports
      // fetchReports(); // Call this function to refresh the list
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the report",
        variant: "destructive",
      });
    } finally {
      setIsDeletingReport((prev) => ({ ...prev, [reportId]: false })); // Set loading state to false
    }
  };

  const handleViewPDF = async (reportId: string) => {
    try {
      setIsViewingPDF((prev) => ({ ...prev, [reportId]: true }));
      const response = await fetch("/api/facility/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }

      const data = await response.json();
      const { pdf } = data;

      // Convert base64 to Blob
      const pdfBlob = base64ToBlob(pdf, "application/pdf");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Open PDF in a new tab
      window.open(pdfUrl, "_blank");
    } catch (error: any) {
      console.error("Error viewing PDF:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while viewing the PDF",
        variant: "destructive",
      });
    } finally {
      setIsViewingPDF((prev) => ({ ...prev, [reportId]: false })); // Set loading state to false
    }
  };
  return (
    <div className="mt-4">
      <h4 className="text-md font-semibold mb-2">Reports</h4>
      <ul className="space-y-2">
        {reports.map((report) => (
          <li
            key={report.id}
            className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
          >
            <div>
              <p className="font-medium ">Report</p>
              <p className="text-sm text-gray-600">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewPDF(report.id)}
                disabled={isViewingPDF[report.id]} // Disable the button while viewing
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>View PDF</span>
                {isViewingPDF[report.id] && (
                  <svg
                    className="animate-spin h-4 w-4 text-blue-500 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(report.id, report.title)}
                disabled={isDownloading[report.id]}
                className="flex items-center space-x-2"
              >
                <File className="w-4 h-4" />
                <span>Download PDF</span>
                {isDownloading[report.id] && (
                  <svg
                    className="animate-spin h-4 w-4 text-blue-500 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendEmail(report.id, report.title)}
                disabled={isSendingEmail[report.id]} // Disable the button while sending email
                className="flex items-center space-x-2"
              >
                <File className="w-4 h-4" />
                <span>{emailButtonLabel[report.id] || "Send to mail"}</span> 
                {isSendingEmail[report.id] && (
                  <svg
                    className="animate-spin h-4 w-4 text-blue-500 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteReport(report.id)}
                disabled={isDeletingReport[report.id]} // Disable the button while deleting
                className="flex items-center space-x-2"
              >
                <File className="w-4 h-4" />
                <span>Delete PDF</span>
                {isDeletingReport[report.id] && (
                  <svg
                    className="animate-spin h-4 w-4 text-blue-500 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                )}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportList;
