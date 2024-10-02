// app/components/Navbar.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react"; // For dropdowns
import avatar from '@/public/users-avatar.png'
import Image from "next/image";
import React from "react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 h-fit max-w-[100rem] mx-auto my-6 px-4 py-2 md:px-6 lg:px-8 w-full bg-white  rounded-lg">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex z-40 font-semibold">
            <img
              src="/logo.png"
              className="w-36 sm:w-40 2xl:w-44"
              alt="HealthPlatform Logo"
            />
          </Link>
         
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
        <Link href="/facilityhome">
            <span className="font-bold pr-10 text-[#067c73] hover:text-blue-700 cursor-pointer">
              FOR LABS & HEALTHCARE PROVIDERS
            </span>
          </Link>
          <Link href="/pricing">
            <button className="text-white  bg-black border border-black text-lg px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-white hover:text-black transition">
              {session ? "Upgrade Now":"Pricing"}
              
            </button>
          </Link>
          <Link href="/faqs">
            <button className="text-white bg-black border border-black text-lg px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-white hover:text-black transition">
              FAQ&apos;s
            </button>
          </Link>
          {session ? (
            <>
              <Link href={session.user.role === 'FACILITY' ? '/facility/dashboard' : "/dashboard"}>
                <button className="text-white bg-black border border-black text-lg px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-white hover:text-black transition">
                  Dashboard
                </button>
              </Link>

              {/* Admin Link (Visible Only to Admins) */}
              {session.user.role === "ADMIN" && (
                <Link href="/admin">
                  <button className="text-white bg-black border border-black text-lg px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-white hover:text-black transition">
                    Admin
                  </button>
                </Link>
              )}

              {/* User Profile Dropdown */}
              <Menu as="div" className="relative inline-block text-left">
                <div className=" rounded-full  flex items-center justify-center">
                  <Menu.Button className="w-8 h-8 rounded-full ">
                   
                      <Image
                        src={avatar}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                   
                    
                    {/* <ChevronDownIcon className="w-5 h-5" aria-hidden="true" /> */}
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block px-4 py-2 text-sm text-gray-700`}
                          >
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          >
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </>
          ) : (
            <Link href="/login">
              <button className="text-white bg-black border border-black text-lg px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-white hover:text-black transition">
                LogIn
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
