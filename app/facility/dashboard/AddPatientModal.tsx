// components/AddPatientModal.tsx

"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

import { useToast } from "@/app/components/ui/use-toast";
import Input from "@/app/components/Input";

interface AddPatientModalProps {
  onPatientAdded: (patient: any) => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ onPatientAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddPatient = async () => {
    if (!name || !email) {
      toast({
        title: "Validation Error",
        description: "Name and Email are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/facility/add-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add patient");
      }

      const data = await response.json();
      onPatientAdded(data.patient);

      toast({
        title: "Success",
        description: "Patient added successfully.",
      });

      // Reset form fields
      setName("");
      setEmail("");
      
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding the patient.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add Patient</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Add New Patient</h2>
        <div className="space-y-4">
          <div>
          <label htmlFor="email" className="block mb-1 font-semibold">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setEmail(e.target.value)}
              placeholder="Enter patient's email"
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          
        />
          </div>
          <div>
          <label htmlFor="email" className="block mb-1 font-semibold">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setName(e.target.value)}
              placeholder="Enter patient's name"
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          
        />
          </div>
          
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAddPatient} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Patient"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientModal;
