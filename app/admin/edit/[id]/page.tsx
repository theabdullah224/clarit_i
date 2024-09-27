// app/admin/edit/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  emailVerified?: string | null; // ISO string
  telephone?: string | null;
  facilityName?: string | null;
  facilityType?: string | null;
  address?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  country?: string | null;
}

const EditUser = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    telephone: "",
    facilityName: "",
    facilityType: "",
    address: "",
    city: "",
    stateProvince: "",
    country: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch user details
  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch user.");
      }
      const data: User = await res.json();
      setUser(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        role: data.role,
        telephone: data.telephone || "",
        facilityName: data.facilityName || "",
        facilityType: data.facilityType || "",
        address: data.address || "",
        city: data.city || "",
        stateProvince: data.stateProvince || "",
        country: data.country || "",
      });
    } catch (error: any) {
      console.error("Error fetching user:", error);
      setMessage({ type: "error", text: error.message });
    }
  };

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading

    if (!session || session.user.role !== "ADMIN") {
      // If not authenticated or not admin, redirect
      router.push("/");
    } else {
      // Fetch the user data
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!form.email || !form.role) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "User updated successfully." });
        // Optionally, redirect back to the admin dashboard
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } else {
        const errorData = await res.json();
        setMessage({ type: "error", text: errorData.message || "Failed to update user." });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage({ type: "error", text: "An unexpected error occurred." });
    }
  };

  if (!user) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Edit User</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md"
      >
        {message && (
          <div
            className={`mb-4 text-center ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}
        {/* Name */}
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            placeholder="User Name"
          />
        </div>
        {/* Email */}
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
        {/* Role */}
        <div className="mb-4">
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
            {/* Prevent editing ADMIN role if necessary */}
            {/* <option value="ADMIN">Admin</option> */}
          </select>
        </div>
        {/* Facility Name (Conditional) */}
        {form.role === "FACILITY" && (
          <>
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
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                placeholder="Facility Name"
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
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                placeholder="e.g., Hospital, Clinic"
              />
            </div>
          </>
        )}
        {/* Telephone */}
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            placeholder="+1234567890"
          />
        </div>
        {/* Address */}
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Street Address"
          />
        </div>
        {/* City */}
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            placeholder="City"
          />
        </div>
        {/* State/Province */}
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            placeholder="State or Province"
          />
        </div>
        {/* Country */}
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Country"
          />
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition"
        >
          Update User
        </button>
        {/* Cancel Button */}
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="w-full mt-2 px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditUser;
