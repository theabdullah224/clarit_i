"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { z } from "zod";
import axios from "axios";
import Spinner from "./Spinner";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email(),
  telephone: z.string().min(1, "Telephone number is required"),
  facilityName: z.string().min(1, "Facility name is required"),
  facilityType: z.enum(["Laboratory", "Hospital", "Medical Centre", "Other"]),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  stateProvince: z.string().min(1, "State/Province is required"),
  country: z.string().min(1, "Country is required"),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export default function Input({ routeName }: { routeName: string }) {

  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    telephone: "",
    facilityName: "",
    facilityType: "",
    address: "",
    city: "",
    stateProvince: "",
    country: "",
    password: "",
    confirmPassword: "",
    termsAgreed: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setError("");
  };

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setProcessing(true);
  
    try {
      if (routeName === "login") {
        const validate = loginSchema.safeParse({ email: formData.email, password: formData.password });
        if (!validate.success) {
          setError("Invalid email or password");
          setProcessing(false);
          return;
        }
  
        const res = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        console.log(res?.status)
  
        if (res?.error) {
          setError("Invalid credentials");
        } 
      } else {
        // Signup process
        const validate = signupSchema.safeParse(formData);
        if (!validate.success) {
          setError(validate.error.errors[0].message);
          setProcessing(false);
          return;
        }
  
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setProcessing(false);
          return;
        }
  
        const res = await axios.post("/api/register", formData);
        if (res.status === 201) {
          alert("Registration successful. A verification code has been sent to your email.");
          router.push("/verify-email");
        }
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError("Email already exists.");
      } else {
        setError("Server error occurred. Please try again.");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex items-center space-y-6 flex-col">
      <form onSubmit={handleSubmit} className="w-[24rem] max-w-md gap-3 flex flex-col">
        {routeName === "signup" && (
          <>
            <input
              name="fullName"
              className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
            <input
              name="telephone"
              className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
              placeholder="Telephone Number *"
              value={formData.telephone}
              onChange={handleInputChange}
              required
            />
            <input
              name="facilityName"
              className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
              placeholder="Facility Name *"
              value={formData.facilityName}
              onChange={handleInputChange}
              required
            />
            <select
              name="facilityType"
              className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
              value={formData.facilityType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Facility Type *</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Hospital">Hospital</option>
              <option value="Medical Centre">Medical Centre</option>
              <option value="Other">Other</option>
            </select>
            <input
              name="address"
              className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
              placeholder="Address *"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            <input
              name="city"
              className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
              placeholder="City *"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
            <input
              name="stateProvince"
              className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
              placeholder="State/Province *"
              value={formData.stateProvince}
              onChange={handleInputChange}
              required
            />
            <input
              name="country"
              className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
              placeholder="Country *"
              value={formData.country}
              onChange={handleInputChange}
              required
            />
          </>
        )}
        <input
          name="email"
          className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
          placeholder="Email address *"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      

        <div className="flex items-center rounded-lg border border-[#000000] py-2 px-3">
          <input
            name="password"
            className="flex-grow text-black bg-transparent outline-none"
            placeholder="Password *"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-2"
          >
            {showPassword ? <FaRegEye color="black" /> : <FaRegEyeSlash color="black" />}
          </button>
        </div>
        {routeName === "signup" && (
          <>
            <input
              name="confirmPassword"
              className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
              placeholder="Confirm Password *"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                name="termsAgreed"
                checked={formData.termsAgreed}
                onChange={handleInputChange}
                required
              />
              <span className="ml-2 text-sm text-black">
                I agree to the Terms and Conditions
              </span>
            </label>
          </>
        )}
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={processing}
          className={`${
            processing ? "cursor-not-allowed" : ""
          } text-white py-2 bg-[#000000] hover:bg-[#333333] rounded-md p-1`}
        >
          {processing ? <Spinner /> : routeName === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>
    </div>
  );
}