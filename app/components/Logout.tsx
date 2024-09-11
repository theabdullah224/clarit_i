"use client";

import { signOut } from "next-auth/react";


const LogoutBtn = () => {
  return (
    <div className="bg-black text-center   text-white w-[10vw]  p-1 rounded-md mx-4">
      <button  onClick={async () => await signOut()}>Logout</button>
    </div>
  );
};
export default LogoutBtn;
