import { getServerSession } from 'next-auth';
import React from 'react'
import { authOptions } from '../api/auth/[...nextauth]/route';
import prisma from '@/prisma';
const page = async () => {

    const session = await getServerSession(authOptions);

    const user = await prisma.user.findUnique({
        where: { email: session?.user.email! },
        select: {
          name: true,
          subscriptionStatus: true,
          subscriptionPlan: true,
        },
      });
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
      </div>

      {/* Profile Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
        <p>
          <strong>Name:</strong> {user?.name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {session?.user.email}
        </p>
        <h2 className="text-2xl font-semibold mb-4 mt-28">Subscription</h2>
        <p>
          <strong>Your Plan:</strong> {user?.subscriptionPlan || "Free"}
        </p>
        <p>
          <strong>Subscription Status:</strong> {user?.subscriptionStatus || "Inactive"}
        </p>
      </div>
      </div>
  )
}


export default page