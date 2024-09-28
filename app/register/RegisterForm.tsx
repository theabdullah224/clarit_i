// app/register/RegisterForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER", // Default role
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

    try {
      const res = await axios.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
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
    <div className="min-h-screen flex items-center justify-center">
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-8 bg-white rounded-lg shadow-md"
    >
      <h2 className="mb-6 text-2xl font-bold text-center">Register</h2>
      {message && (
        <div
          className={`mb-4 text-center ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}
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
      <div className="mb-4">
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
      {/* Optional: Role Selection */}
      {/* Uncomment if you want users to select their role during registration */}
      
      {/* <div className="mb-4">
        <label htmlFor="role" className="block mb-1 font-semibold">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        >
          <option value="USER">User</option>
          <option value="FACILITY">Facility</option>
        </select>
      </div> */}
     
      <button
        type="submit"
        className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition"
      >
        Register
      </button>
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </form>
    </div>

  );
};

export default RegisterForm;
