// components/UploadLabResultModal.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, List } from "lucide-react";
import { Progress } from "@/app/components/ui/progress";
import { useToast } from "@/app/components/ui/use-toast";
import { createWorker } from 'tesseract.js';
import * as PDFJS from 'pdfjs-dist';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

interface LabResult {
  id: string;
  extractedText: string;
  uploadedAt: string;
}

interface Report {
  id: string;
  title: string;
  content: string;
  createdAt: string;
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

interface UploadLabResultModalProps {
  patient: Patient;
  onLabResultUploaded: (patientId: string, labResult: LabResult) => void;
  onReportAdded: (patientId: string, report: Report) => void;
}

const UploadLabResultModal: React.FC<UploadLabResultModalProps> = ({
  patient,
  onLabResultUploaded,
  onReportAdded,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Set up the worker source for pdfjs
    PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
  }, []);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: TextItem | TextMarkedContent) => {
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
      fullText += pageText + ' ';
    }

    return fullText;
  };

  const extractTextFromImage = async (file: File) => {
    const worker = await createWorker('eng');
    const imageUrl = URL.createObjectURL(file);
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();
    return text;
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      let allText = '';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileText = '';

        if (file.type === 'application/pdf') {
          fileText = await extractTextFromPdf(file);
        } else if (file.type.startsWith('image/')) {
          fileText = await extractTextFromImage(file);
        }

        allText += fileText + '\n\n';
        setProgress(((i + 1) / files.length) * 50); // Extraction up to 50%
      }

      // Upload the extracted text to the server
      const uploadResponse = await fetch("/api/facility/upload-lab-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, content: allText }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Failed to upload lab results');
      }

      const uploadData = await uploadResponse.json();
      onLabResultUploaded(patient.id, uploadData.labResult);

      toast({
        title: "Success",
        description: "Lab results uploaded successfully.",
      });

      setProgress(50);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "Error uploading files.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(50);
    }
  };

  const handleGenerateReport = async () => {
    setIsProcessing(true);
    setProgress(50);

    try {
      // Process with OpenAI
      const openaiResponse = await fetch("/api/facility/process-openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, labResults: patient.labResults }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        throw new Error(errorData.message || 'Failed to process with OpenAI');
      }

      const openaiData = await openaiResponse.json();
      const report = openaiData.report;
      onReportAdded(patient.id, report);

      setProgress(75);

      // Generate PDF
      // const pdfResponse = await fetch("/api/generate-pdf", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ reportId: report.id }),
      // });

      // if (!pdfResponse.ok) {
      //   const errorData = await pdfResponse.json();
      //   throw new Error(errorData.message || 'Failed to generate PDF');
      // }

      // const pdfData = await pdfResponse.json();
      // const { pdf } = pdfData;

      // // Convert base64 to Blob
      // const pdfBlob = base64ToBlob(pdf, "application/pdf");
      // const pdfUrl = URL.createObjectURL(pdfBlob);

      // // Create a link and trigger download
      // const link = document.createElement("a");
      // link.href = pdfUrl;
      // link.download = `${report.title}.pdf`;
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);

      // setProgress(100);
      // setIsOpen(false);

      // toast({
      //   title: "Success",
      //   description: "Report processed and PDF generated successfully.",
      // });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  // Helper function to convert base64 to Blob
  // const base64ToBlob = (base64: string, type: string) => {
  //   const binary = atob(base64);
  //   const array = [];
  //   for (let i = 0; i < binary.length; i++) {
  //     array.push(binary.charCodeAt(i));
  //   }
  //   return new Blob([new Uint8Array(array)], { type });
  // };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <File className="w-4 h-4 mr-2" />
          Upload Lab Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Upload Lab Results for {patient.name}</h2>
        <Dropzone
          accept={{
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.gif', '.jpeg', '.jpg']
          }}
          multiple={true}
          onDrop={async (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
              await processFiles(acceptedFiles);
            }
          }}
        >
          {({ getRootProps, getInputProps, acceptedFiles }) => (
            <div {...getRootProps()} className='border h-40 m-4 border-dashed border-gray-300 rounded-md'>
              <div className='flex items-center justify-center h-full w-full'>
                <label htmlFor='dropzone-file' className='flex flex-col items-center justify-center w-full h-full rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100'>
                  <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <Cloud className='h-6 w-6 text-zinc-500 mb-2' />
                    <p className='mb-2 text-sm text-zinc-700'>
                      <span className='font-semibold'>Click to upload</span> or drag and drop
                    </p>
                    <p className='text-xs text-zinc-500'>PDF or Image</p>
                  </div>

                  {acceptedFiles && acceptedFiles.length > 0 && (
                    <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                      <div className='px-3 py-2 h-full grid place-items-center'>
                        <File className='h-4 w-4 text-blue-500' />
                      </div>
                      <div className='px-3 py-2 h-full text-sm truncate'>
                        {acceptedFiles.map((file) => file.name).join(", ")}
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className='w-full mt-4 max-w-xs mx-auto'>
                      <Progress value={progress} className='h-1 w-full bg-zinc-200' />
                    </div>
                  )}

                  <input {...getInputProps()} type='file' id='dropzone-file' className='hidden' />
                </label>
              </div>
            </div>
          )}
        </Dropzone>

        {/* Generate Report Button */}
        {patient.labResults && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleGenerateReport}
              disabled={isProcessing}
              className="flex items-center space-x-2"
            >
              <List className="w-4 h-4" />
              <span>Generate Report</span>
              {isProcessing && (
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UploadLabResultModal;
