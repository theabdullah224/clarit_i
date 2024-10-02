// payment success
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]';

export default async function SuccessPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-xl mb-8">Thank you for your purchase.</p>
      <Link href={user?.role === "FACILITY" ? "/facility/dashboard" : "/dashboard"}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}