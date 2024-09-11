import Link from "next/link";


import { getServerSession } from "next-auth";

const Navbar = async () => {
  const session = await getServerSession()!;
 const user = session?.user?.email
  return (
    <nav className="sticky h-fit max-w-[100rem] mx-auto my-6 px-4 md:px-6 lg:px-8   w-full bg-white ">
      <div className="flex  items-center justify-between ">
        <div className="flex items-center gap-6">
        <Link href="/" className="flex z-40 font-semibold">
          <img
            src="/logo.png"
            className="w-36  sm:w-40 2xl:w-44"
            alt={""}
          
          />
        </Link>
          <Link href="/facilityhome">
            <p className="font-bold hover:text-blue-700">FOR LABS & HEALTHCARE PROVIDERS</p>
          </Link>
          </div>
        <div className="space-x-2 items-center sm:space-x-4 sm:flex">
          <Link href="/pricing">
            <button className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-l px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
              Pricing
            </button>
          </Link>
          <Link href="/faqs">
            <button className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-l px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
              Faq&apos;s
            </button>
          </Link>
          <Link href={user ? "/home" : "/login"}>
            <button className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-l px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
            {user ? "Dashboard" : "LogIn"}
            </button>
          </Link>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
