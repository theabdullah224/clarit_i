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
  const [isDownloading, setIsDownloading] = useState<{ [key: string]: boolean }>({});
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
          description: error.message || "An error occurred while fetching reports.",
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
        description: error instanceof Error ? error.message : "An error occurred while sending the PDF to email",
        variant: "destructive",
      });
    }
  };
  









  
  return (
    <div className="mt-4">
      <h4 className="text-md font-semibold mb-2">Reports</h4>
      <ul className="space-y-2">
        {reports.map((report) => (
          <li key={report.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
            <div>
              <p className="font-medium ">Report</p>
              <p className="text-sm text-gray-600">{new Date(report.createdAt).toLocaleString()}</p>
            </div>

            <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(report.id, report.title)}
              className="flex items-center space-x-1"
              >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
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
                    </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportList;
