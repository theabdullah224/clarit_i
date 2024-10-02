"use client";
// import authOptions from "../auth/authOptions";
import Image from "next/image";
import pfp from "@/public/user-pfp.png";
import { useSession } from "next-auth/react";

const UserReply = ({ text }: { text: string }) => {
  const { data: session, status } = useSession();

  return (
    <div className="user-reply self-end md:mr-8 items-center  flex pr-6  gap-4  bg-[#8638ebcb] p-2 max-w-max  md:w-[80%]  rounded-md text-white ">
      {session?.user?.image ? (
        <Image
          width={34}
          height={34}
          className="rounded-full"
          src={session.user.image}
          alt="pfp"
        />
      ) : (
        <Image
          width={34}
          className="bg-white rounded-full"
          src={pfp}
          alt="default pfp"
        />
      )}
      {text}
    </div>
  );
};
export default UserReply;
