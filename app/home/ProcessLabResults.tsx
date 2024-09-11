"use client";

import { useState, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/app/components/ui/dialog";
import { Progress } from "@/app/components/ui/progress";
import { useToast } from "@/app/components/ui/use-toast";
import { List } from "lucide-react";
import { useRouter } from "next/navigation";

const individualTests = [
  "Complete Blood Count",
  "Lipid Panel",
  "Liver Function Test",
  "Kidney Function Test",
  "Thyroid Function Test",
  "Hemoglobin A1C",
  "Vitamin D",
  "Prostate-Specific Antigen",
  "C-Reactive Protein"
];

const reportTypes = ["Basic Report", "Full Report"];

const ProcessLabResults = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleTestSelection = useCallback((test: string) => {
    setSelectedTests(prev => {
      if (reportTypes.includes(test)) {
        // If selecting a report type, clear all other selections
        return prev.includes(test) ? [] : [test];
      } else {
        // If selecting an individual test
        const newSelection = prev.filter(t => !reportTypes.includes(t)); // Remove any report types
        if (newSelection.includes(test)) {
          return newSelection.filter(t => t !== test); // Remove the test if already selected
        } else {
          return [...newSelection, test]; // Add the test if not already selected
        }
      }
    });
  }, []);

  const handleSubmit = async () => {
    if (selectedTests.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one test type or report",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Fetch lab results based on selected tests
      const fetchResponse = await fetch("/api/fetch-lab-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTests }),
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
        body: JSON.stringify({ labResults, selectedTests }),
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


      
      setIsOpen(false);
      setProgress(100);

      router.push('/analyzedReports/[id]')
      
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
        <Button className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center transition-opacity duration-200 hover:opacity-80">
          <List className="w-4 h-4 mr-2" />
          Process Lab Results
        </Button>
      </DialogTrigger>
      <DialogContent>
        <h3 className="text-lg font-semibold mb-2">Select Report Type or Individual Tests:</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {reportTypes.map(type => (
            <Button
              key={type}
              onClick={() => handleTestSelection(type)}
              variant={selectedTests.includes(type) ? "default" : "outline"}
            >
              {type}
            </Button>
          ))}
        </div>
        <h4 className="text-md font-semibold mb-2">Individual Tests:</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {individualTests.map(test => (
            <Button
              key={test}
              onClick={() => handleTestSelection(test)}
              variant={selectedTests.includes(test) ? "default" : "outline"}
            >
              {test}
            </Button>
          ))}
        </div>
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isProcessing || selectedTests.length === 0}
        >
          {isProcessing ? "Processing..." : "Submit"}
        </Button>
        {isProcessing && (
          <Progress value={progress} className="mt-2" />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProcessLabResults;