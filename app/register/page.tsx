// app/register/page.tsx

"use client";

import RegisterForm from "./RegisterForm";

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
