// app/register/facility/FacilityRegisterForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const FacilityRegisterForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "FACILITY", // Fixed role for facility users
    facilityName: "",
    facilityType: "",
    address: "",
    city: "",
    stateProvince: "",
    country: "",
    telephone: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (form.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    // Additional Validation for Facility Fields
    if (
      !form.facilityName ||
      !form.facilityType ||
      !form.address ||
      !form.city ||
      !form.stateProvince ||
      !form.country ||
      !form.telephone
    ) {
      setMessage({ type: "error", text: "Please fill in all facility details." });
      return;
    }

    try {
      const res = await axios.post("/api/auth/register/facility", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        facilityName: form.facilityName,
        facilityType: form.facilityType,
        address: form.address,
        city: form.city,
        stateProvince: form.stateProvince,
        country: form.country,
        telephone: form.telephone,
      });

      if (res.status === 201) {
        setMessage({ type: "success", text: res.data.message });
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/verify");
        }, 3000);
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Registration failed.",
      });
    }
  };

  return (
    <div className="w-full py-10 min-h-screen flex items-center justify-center ">
    <form
      onSubmit={handleSubmit}
      className="w-full p-8 bg-white rounded-lg shadow-md max-w-md"
    >
      <h2 className="mb-6 text-2xl font-bold text-center">Register as Facility</h2>
      {message && (
        <div
          className={`mb-4 text-center ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}
      {/* User Details */}
      <div className="mb-4">
        <label htmlFor="name" className="block mb-1 font-semibold">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Your Name"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className="block mb-1 font-semibold">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="you@example.com"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block mb-1 font-semibold">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="********"
          minLength={6}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="confirmPassword" className="block mb-1 font-semibold">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="********"
          minLength={6}
        />
      </div>

      {/* Facility Details */}
      <h3 className="mb-4 text-xl font-semibold">Facility Details</h3>
      <div className="mb-4">
        <label htmlFor="facilityName" className="block mb-1 font-semibold">
          Facility Name
        </label>
        <input
          type="text"
          id="facilityName"
          name="facilityName"
          value={form.facilityName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Your Facility Name"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="facilityType" className="block mb-1 font-semibold">
          Facility Type
        </label>
        <input
          type="text"
          id="facilityType"
          name="facilityType"
          value={form.facilityType}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="e.g., Hospital, Clinic, Laboratory"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="telephone" className="block mb-1 font-semibold">
          Telephone
        </label>
        <input
          type="tel"
          id="telephone"
          name="telephone"
          value={form.telephone}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="e.g., +1234567890"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="address" className="block mb-1 font-semibold">
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Street Address"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="city" className="block mb-1 font-semibold">
          City
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={form.city}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="City"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="stateProvince" className="block mb-1 font-semibold">
          State/Province
        </label>
        <input
          type="text"
          id="stateProvince"
          name="stateProvince"
          value={form.stateProvince}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="State or Province"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="country" className="block mb-1 font-semibold">
          Country
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={form.country}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Country"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition"
      >
        Register as Facility
      </button>
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-green-600 hover:underline">
          Login
        </Link>
      </p>
    </form>
    </div>
  );
};

export default FacilityRegisterForm;
