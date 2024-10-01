// app/login/LoginForm.tsx

"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginForm = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading

    if (session) {
      // Redirect based on user role
      if (session.user.role === "ADMIN") {
        router.push("/admin");
      } else if (session.user.role === "FACILITY"){
        router.push("/pricing");
      } else {
        router.push("/pricing");
      }
    }
  }, [session, status, router]);


  const openModal = () => {
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!form.email || !form.password) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setMessage({ type: "error", text: res.error });
    } else {
      setMessage({ type: "success", text: "Login successful! Redirecting..." });
      // The redirection will be handled by useEffect
    }
  };

  return (
    <div className="min-h-screen w-full flex  items-center justify-center">

   
    <form
      onSubmit={handleSubmit}
      className="w-full minhs max-w-md p-8 bg-white rounded-lg shadow-md"
    >
      <h2 className="mb-6 text-2xl font-bold text-center">Login</h2>
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
      <div className="mb-6">
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
      <button
        type="submit"
        className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition"
      >
        Login
      </button>
      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{" "}

        
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
      <p className="mt-2 text-center text-gray-600">
        Forgot your password?{" "}
        <Link href="/reset-password" className="text-blue-600 hover:underline">
          Reset Password
        </Link>
      </p>
    </form>
    </div>

  );
};

export default LoginForm;
