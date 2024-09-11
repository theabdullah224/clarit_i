import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-xl mb-8">Thank you for your purchase.</p>
      <Link href="/"
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}