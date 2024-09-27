// app/register/facility/page.tsx

"use client";

import FacilityRegisterForm from "./FacilityRegisterForm";









const FacilityRegisterPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <FacilityRegisterForm/>
      </div>
    </div>
  );
};

export default FacilityRegisterPage;
