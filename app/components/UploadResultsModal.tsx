"use client";
// simple user
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, List } from "lucide-react";
import { Progress } from "@/app/components/ui/progress";
import { useToast } from "@/app/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createWorker } from 'tesseract.js';
import { useSession } from "next-auth/react";
// PDF.js imports
import * as PDFJS from 'pdfjs-dist';
// import * as pdfjsLib from 'pdfjs-dist';
// import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
// 
// import { getDocument } from 'pdfjs-dist/build/pdf.mjs';

async function getDocument(url: string | ArrayBuffer) {
  // Step 1: Fetch the PDF document from the URL or ArrayBuffer
  let pdfData: ArrayBuffer;

  if (typeof url === 'string') {
    // Fetch the PDF from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error fetching the PDF file');
    }
    pdfData = await response.arrayBuffer();
  } else {
    // PDF is already provided as an ArrayBuffer
    pdfData = url;
  }

  // Step 2: Parse the PDF (this is extremely simplified)
  const pdfDocumentProxy = parsePDF(pdfData); // Placeholder for actual PDF.js logic

  // Return a promise that resolves to a PDFDocumentProxy object
  return pdfDocumentProxy;
}

// Step 3: A function that mimics PDF parsing (in reality, it's much more complex)
function parsePDF(pdfData: ArrayBuffer): any {
  // Normally, this would involve decoding the PDF binary structure
  // and extracting objects like pages, metadata, etc.
  // We'll just return a mock object for simplicity.
  return {
    numPages: 5,
    getPage: function (pageNumber: number) {
      return new Promise((resolve) => {
        resolve({
          pageNumber,
          render: function () {
            console.log(`Rendering page ${pageNumber}`);
            return {
              promise: Promise.resolve(),
            };
          },
        });
      });
    },
  };
}

interface LabResult {
  id: string;
  extractedText: string;
  // Add other fields as necessary
}
interface FetchReportsResponse {
  reports: Report[];
}
const UploadResultsModal = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const { data: session } = useSession();
  const { toast } = useToast();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const storedPlan = localStorage.getItem('userPlan');
    
    if (storedPlan) {
      // @ts-ignore
      setPlan(storedPlan);
    }

    if (session?.user?.id) {
      fetch('/api/getUserPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
          } else {
            setPlan(data.plan);
            localStorage.setItem('userPlan', data.plan);
          }
        })
        .catch((err) => console.error('Error fetching plan:', err));
    }
  }, [session]);

  
  useEffect(() => {
    // Set up the worker source for pdfjs
    PDFJS.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
  }, []);


  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // @ts-ignore
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
  
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        console.log("------>>>",textContent)
        const pageText = textContent.items
        .map((item: any) => { // Use 'any' if types are not defined
          if (item && 'str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');
        console.log(pageText)
  
        fullText += pageText + ' ';
        console.log(fullText)
      }
  
      return fullText;
    } catch (error) {
      console.log('Error extracting text from PDF:', error);
      return '';
    }
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
    setLabResults([]); // Reset previous lab results

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
        setProgress(((i + 1) / files.length) * 50); // Upload and extract takes up to 50% progress
      }

      // Upload the extracted text to the server
      const uploadResponse = await fetch("/api/upload-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: allText }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Failed to upload lab results');
      }

      const uploadData = await uploadResponse.json();
      toast({
        title: "Success",
        description: "Lab results uploaded successfully",
      });

      setProgress(50);

      // Fetch lab results
      const fetchResponse = await fetch("/api/fetch-lab-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.message || 'Failed to fetch lab results');
      }

      const fetchData = await fetchResponse.json();
      setLabResults(fetchData.labResults);
      setProgress(60);

      toast({
        title: "Success",
        description: "Lab results fetched successfully",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleGenerateReport = async () => {
    if(plan === "FREE"){

    
    if (labResults.length === 0) {
      toast({
        title: "No Lab Results",
        description: "Please upload and extract lab results first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(60); // Starting from where processFiles left

    try {
      // Process with OpenAI
      const openaiResponse = await fetch("/api/process-openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labResults }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        throw new Error(errorData.message || 'Failed to process with OpenAI');
      }

      const openaiData = await openaiResponse.json();
      const report = openaiData.report;
      
      // ------------fetch reports------------
      const response = await fetch("/api/fetch-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch reports");
      }

      const data: FetchReportsResponse = await response.json();
      const finaldata: Report[] = data.reports;
    
      localStorage.setItem('reportsdata', JSON.stringify(finaldata)); 
      
      // ------------------------------
      setProgress(80);

      toast({
        title: "Report Generated",
        description: "Report generated successfully. Generating PDF...",
      });

     
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsOpen(false)
      setIsProcessing(false);
      setProgress(100);
    }
  }else{
    alert("Please Subscribe")
  }

  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64: string, type: string) => {
    const binary = atob(base64);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
          <Cloud className="w-4 h-4 mr-2" />
          Upload Lab Results
        </Button>
      </DialogTrigger>
      <DialogContent>
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
            <div {...getRootProps()} className='border h-64 m-4 border-dashed border-gray-300 rounded-md'>
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
  <div className="flex flex-col gap-2 max-h-[10rem] overflow-auto">
    {acceptedFiles.map((file, index) => (
      <div key={index} className="flex gap-2 items-center">
        <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
          <div className='px-3 py-2 h-full grid place-items-center'>
            <File className='h-4 w-4 text-blue-500' />
          </div>
          <div className='px-3 py-2 h-full text-sm truncate'>
            {file.name}
          </div>
        </div>
        
      </div>
    ))}
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

        {/* Display Generate Report Button */}
        {labResults.length > 0 && (
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

export default UploadResultsModal;
