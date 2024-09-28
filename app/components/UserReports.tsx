// components/UserReports.tsx

"use client";

import { useEffect, useState } from "react";
import { Report } from "@prisma/client"; // Adjust the import based on your Prisma setup
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { useToast } from "@/app/components/ui/use-toast";
import { File } from "lucide-react";

interface FetchReportsResponse {
  reports: Report[];
}

const UserReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/fetch-reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch reports");
        }

        const data: FetchReportsResponse = await response.json();
        setReports(data.reports);
      } catch (error: any) {
        console.error("Error fetching reports:", error);
        toast({
          title: "Error",
          description: error.message || "An error occurred while fetching reports",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

  const handleDownload = async (reportId: string, reportTitle: string) => {
    setIsDownloading((prev) => ({ ...prev, [reportId]: true }));
    try {
      const response = await fetch("/api/generate-pdf", {
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
        description: error.message || "An error occurred while downloading the PDF",
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
      // First, generate the PDF
      const pdfResponse = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
  
      if (!pdfResponse.ok) {
        const errorData = await pdfResponse.json();
        throw new Error(errorData.message || "Failed to generate PDF");
      }
  
      const { pdf } = await pdfResponse.json();
  
      // Now send the PDF via email
      const emailResponse = await fetch("/api/send-pdf-email", {
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
        description: "PDF sent to your email successfully",
      });
    } catch (error: any) {
      console.error("Error sending PDF to email:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending the PDF to email",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (reportId: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      try {
        const response = await fetch("/api/delete-report", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId }),
        });
  
        // Check if the response is OK
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete report");
        }
  
        // Update the reports state to remove the deleted report
        setReports((prevReports) => prevReports.filter(report => report.id !== reportId));
  
        toast({
          title: "Success",
          description: "Report deleted successfully",
        });
      } catch (error: any) {
        console.error("Error deleting report:", error);
        toast({
          title: "Error",
          description: error.message || "An error occurred while deleting the report",
          variant: "destructive",
        });
      }
    }
  };
  


  const handleViewPDF = async (reportId: string) => {
    try {
      const response = await fetch("/api/generate-pdf", {  // Changed from "/api/facility/generate-pdf"
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
      window.open(pdfUrl, '_blank');
    } catch (error: any) {
      console.error("Error viewing PDF:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while viewing the PDF",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="mt-6 ">
      <h2 className="text-xl font-semibold  mb-4">Your Reports</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4  border-b">Title</th>
              <th className="py-2  border-b">Created At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-100 border-b ">
                <td className="py-2 px-4  flex justify-center">Report</td>
                <td className="py-2 px-4  justify-center  ">
                  <div className=" flex items-center justify-center">
                  {new Date(report.createdAt).toLocaleString()}

                  </div>
                </td>
                <td className="py-2 flex justify-center px-4 gap-5 ">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPDF(report.id)}
                    className="flex items-center space-x-2"
                  >
                    <File className="w-4 h-4" />
                    <span>View PDF</span>
                  
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
                    className="flex items-center space-x-2"
                  >
                    <File className="w-4 h-4" />
                    <span>Send to email</span>
                  
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                    className="flex items-center space-x-2"
                  >
                    <File className="w-4 h-4" />
                    <span>Delete report</span>
                  
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserReports;
