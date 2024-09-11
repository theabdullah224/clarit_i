
import localFont from "next/font/local";
import { Poppins } from "next/font/google";
import Link from "next/link";

export const nexa = localFont({
  src: "./fonts/Nexa Bold.otf",
});
const poppins = Poppins({ weight: ["600"], subsets: ["latin"] });

export function AuthMask() {
  return (
    <div
      className={`flex flex-col items-center justify-center  pb-16 ${nexa.className}  gap-10`}
    >
     
      <div className="space-y-6 md:space-y-8">
        <p className="uppercase text-center leading-6 font-semibold text-xl md:text-3xl tracking-wide text-black">
          Welcome 
        </p>
        <AuthButtons />
      </div>
    </div>
  );
}

export function AuthButtons() {
  return (
    <div className={`${poppins.className} w-full flex justify-center gap-6`}>
      <Link href="/login">
        <button className="text-[#000000] active:bg-[#000000] border border-[#000000]  text-xl px-6 md:px-10 py-2 font-semibold rounded-lg hover:bg-[#000000] hover:text-white transition">
          Log In
        </button>
      </Link>

      <Link href="/signup">
        <button className="text-[#000000] active:bg-[#000000] border border-[#000000] text-xl px-6 md:px-10 py-2 hover:bg-[#000000] hover:text-white transition font-semibold rounded-lg ">
          Sign Up
        </button>
      </Link>
    </div>
  );
}
