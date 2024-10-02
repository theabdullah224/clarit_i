// app/admin/page.tsx
'use client'
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { PrismaClient, Role } from "@prisma/client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const prisma = new PrismaClient();

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  emailVerified?: Date | null;
  telephone?: string | null;
  facilityName?: string | null;
  facilityType?: string | null;
  address?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  country?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      } else {
        console.error("Failed to fetch users.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = users.filter((user) =>
        (user.name && user.name.toLowerCase().includes(lowerCaseQuery)) ||
        (user.email && user.email.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Handle Delete User
  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove the deleted user from the state
        setUsers(users.filter((user) => user.id !== userId));
        setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
        alert("User deleted successfully.");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An unexpected error occurred.");
    }
  };

  // Handle Edit User
  const handleEdit = (userId: string) => {
    // Redirect to the edit page (you need to create this page)
    router.push(`/admin/edit/${userId}`);
  };

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-left">Email Verified</th>
              {/* Facility Specific Columns */}
              <th className="py-3 px-6 text-left">Facility Name</th>
              <th className="py-3 px-6 text-left">Facility Type</th>
              <th className="py-3 px-6 text-left">Telephone</th>
              <th className="py-3 px-6 text-left">Address</th>
              <th className="py-3 px-6 text-left">City</th>
              <th className="py-3 px-6 text-left">State/Province</th>
              <th className="py-3 px-6 text-left">Country</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-4 text-center">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-6 text-left">{user.name || "-"}</td>
                  <td className="py-3 px-6 text-left">{user.email || "-"}</td>
                  <td className="py-3 px-6 text-left">{user.role}</td>
                  <td className="py-3 px-6 text-left">
                    {user.emailVerified
                      ? new Date(user.emailVerified).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.facilityName || "-"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.facilityType || "-"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.telephone || "-"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.address || "-"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.city || "-"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.stateProvince || "-"}
                  </td>
                  <td className="py-3 px-6 text-left">
                    {user.country || "-"}
                  </td>
                  <td className="py-3 px-6 text-left space-x-2">
                    <button
                      onClick={() => handleEdit(user.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
