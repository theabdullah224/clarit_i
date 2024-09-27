// app/login/page.tsx

"use client";

import LoginForm from "./LoginForm";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
