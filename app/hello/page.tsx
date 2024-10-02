// src/App.js
"use client"
import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';

function App() {
  const [pdfTexts, setPdfTexts] = useState([]);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      console.log("inside pdf extract")
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
  
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item && 'str' in item ? item.str : ''))
          .join(' ');
  
        fullText += pageText + ' ';
      }
  
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return '';
    }
  };
  
  const handleFileChange = async (event: { target: { files: any; }; }): Promise<void> => {
    const files = event.target.files;
    const texts: string[] = [];
  
    try {
      // Loop through each selected file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Use extractTextFromPdf for each file
        const extractedText = await extractTextFromPdf(file);
        texts.push(extractedText);
      }
  
      // Once all files are processed, update the state
    //@ts-ignore
      setPdfTexts(texts); // Assuming setPdfTexts is the state setter function
  
    } catch (error) {
      console.error('Error processing files:', error);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">PDF Text Extractor</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        multiple
        className="mb-4 border border-gray-300 rounded p-2 text-black"
      />
      {pdfTexts.length > 0 && (
        <div className="w-full max-w-xl text-black">
          {pdfTexts.map((text, index) => (
            <textarea
              key={index}
              value={text}
              readOnly
              className="w-full h-64 border text-black border-gray-300 rounded p-2 mb-4"
              placeholder={`Extracted text from PDF ${index + 1}...`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
