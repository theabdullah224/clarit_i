// // app/verify/page.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import axios from "axios";
// import Link from "next/link";

// const VerifyPage = () => {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [message, setMessage] = useState<string | null>("Verifying your email...");
//   const [isVerified, setIsVerified] = useState<boolean>(false);

//   useEffect(() => {
//     const verifyEmail = async () => {
//       const code = searchParams.get("code");
//       const email = searchParams.get("email");

//       if (!code || !email) {
//         setMessage("Invalid verification link.");
//         return;
//       }

//       try {
//         const res = await axios.post("/api/auth/verify", { code, email });

//         if (res.status === 200) {
//           setMessage("Email verified successfully! Redirecting to login...");
//           setIsVerified(true);
//           setTimeout(() => {
//             router.push("/dashboard");
//           }, 3000);
//         }
//       } catch (error: any) {
//         setMessage(error.response?.data?.message || "Verification failed.");
//       }
//     };

//     verifyEmail();
//   }, [searchParams, router]);

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
//       <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
//         <h2 className="mb-4 text-2xl font-bold">Email Verification</h2>
//         <p className="text-gray-600">{message}</p>
//         {isVerified && (
//           <Link href="/dashboard">
//             <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
//               Go to Login
//             </button>
//           </Link>
//         )}
//       </div>
//     </div>
//   );
// };

// export default VerifyPage;



import EmailVerification from './EmailVerification';

export default function VerifyEmailPage() {
  return <EmailVerification />;
}