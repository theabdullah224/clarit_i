"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, List } from "lucide-react";
import { Progress } from "@/app/components/ui/progress";
import { useToast } from "@/app/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { createWorker } from 'tesseract.js';

// PDF.js imports
import * as PDFJS from 'pdfjs-dist';
import { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';




const UploadResultsModal = ()  => {

  const router = useRouter()
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
    const pdf = await PDFJS.getDocument(arrayBuffer).promise;
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
        setProgress((i + 1) / files.length * 100);
      }

      // Upload the extracted text to the server
      const response = await fetch("/api/upload-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: allText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      
      toast({
        title: "Success",
        description: "Lab results uploaded successfully",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error uploading files",
        variant: "destructive",
      });
    } 
    try {
      // Fetch lab results based on selected tests
      const fetchResponse = await fetch("/api/fetch-lab-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({  }),
      });
  
      if (!fetchResponse.ok) {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }
  
      const { labResults } = await fetchResponse.json();
      setProgress(33);
  
      // Process with OpenAI
      const openaiResponse = await fetch("/api/process-openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labResults }),
      });
  
      if (!openaiResponse.ok) {
        throw new Error(`HTTP error! status: ${openaiResponse.status}`);
      }
  
      setProgress(66);
  
      // Generate PDF
      const pdfResponse = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId: labResults.id }),
      });
  
      if (!pdfResponse.ok) {
        throw new Error(`HTTP error! status: ${pdfResponse.status}`);
      }
      const { id } = await pdfResponse.json();
      console.log(id)
  setIsProcessing(false)
      
      setIsOpen(false);
      setProgress(100);
  
      
      
      toast({
        title: "Success",
        description: "Lab results processed and PDF generated successfully",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  



  
  return (
    
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center transition-opacity duration-200 hover:opacity-80">
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

                  {acceptedFiles && acceptedFiles[0] && (
                    <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                      <div className='px-3 py-2 h-full grid place-items-center'>
                        <File className='h-4 w-4 text-blue-500' />
                      </div>
                      <div className='px-3 py-2 h-full text-sm truncate'>
                        {acceptedFiles[0].name}
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
      </DialogContent>
    </Dialog>
  );
};

export default UploadResultsModal;