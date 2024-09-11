import Image from "next/image";
import logo from "@/public/logo.png";
import { Open_Sans } from "next/font/google";

import Link from "next/link";

import Input from "./Input";
const openSans = Open_Sans({ subsets: ["latin"] });

const AuthContainer = ({
  routeName,
  routeText,
}: {
  routeName: string;
  routeText: string;
}) => {
  return (
    <div className=" flex min-h-[100lvh] items-center  bg-no-repeat bg-cover  ">
      <div className="flex-[2] h-[100vh]    flex-col flex items-center ">
        <Image src={logo} alt="logo" className="w-40 my-10 md:mt-36 md:w-40 " />
        <div className="flex-col w-1/2 items-center flex gap-3 md:gap-4">
          <h2
            className={`${openSans.className} text-center mb-4 md:mb-6 font-semibold text-2xl md:text-3xl text-white`}
          >
            {routeName == "login" ? "Log In" : "Create your account"}
          </h2>
          <Input routeName={routeName} />
          <p className="text-[#000000] whitespace-nowrap mb-24">
            {routeText}
            <Link
              href={routeName == "login" ? "/signup" : "/login"}
              className="hover:underline  cursor-pointer ml-2"
            >
              {routeName == "login" ? "Sign up" : "Log in"}
            </Link>

            {/* <Link href="/verify-email" className="text-blue-500 hover:underline">
  Need to verify your email?
</Link> */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
