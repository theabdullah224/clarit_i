// app/dashboard/UserDashboardClient.tsx

"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import UploadResultsModal from "../components/UploadResultsModal";
import UserReports from "../components/UserReports";

const UserDashboardClient = ({ session, user }: { session: any; user: any }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen max-w-[100rem] w-full mx-auto p-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>
        <UploadResultsModal />
      </div>

      {/* Profile Section */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
        <p>
          <strong>Name:</strong> {user.name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {session.user.email}
        </p>
        <p>
          <strong>Your Plan:</strong> {user.subscriptionPlan || "Free"}
        </p>
        <p>
          <strong>Subscription Status:</strong> {user.subscriptionStatus || "Inactive"}
        </p>
      </div> */}

      {/* Recent Activities Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Placeholder for activities */}
        <UserReports />
      </div>
    </div>
  );
};

export default UserDashboardClient;
