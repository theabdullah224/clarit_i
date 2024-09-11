'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function EmailVerification() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      const response = await axios.post('/api/verify-email', { email, code });
      if (response.status === 200) {
        alert('Email verified successfully!');
        router.push('/login');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleVerification} className="w-[24rem] max-w-md gap-3 flex flex-col">
        <h1 className="text-2xl text-center font-bold mb-4">Verify Your Email</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
           className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
        />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter verification code"
          required
           className="rounded-lg text-black bg-transparent border border-[#000000] py-2 px-3"
        />
        <button 
          type="submit" 
          disabled={processing}
          className={`${
            processing ? "cursor-not-allowed" : ""
          } text-white py-2 bg-[#000000] hover:bg-[#333333] rounded-md p-1`}
        >
          {processing ? 'Verifying...' : 'Verify'}
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
}