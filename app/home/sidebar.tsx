import LogoutBtn from "../components/Logout";

import Link from "next/link";
import prisma from "@/prisma";
import { getServerSession } from "next-auth";


import { Key } from "react";
import UploadResultsModal from "./uploadResultsModal";
const Sidebar = async ({ email }: { email: string }) => {
  const session = await getServerSession()!;
  const reports = await prisma.analyzedResult.findMany({
    where: { userEmail: session?.user?.email! },
  });

  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    select: { subscriptionPlan: true, subscriptionStatus: true },
  });
  const planType = user?.subscriptionPlan ? user.subscriptionPlan : "Free";

  const status = user?.subscriptionStatus;

  return (
    <div className=" hidden bg-muted py-6 sm:flex gap-48 flex-col  text-black min-w-[200px] w-1/5 h-full mr-auto">
      <div className="space-y-4 h-full w-full mt-12  flex flex-col items-center">
        <h2 className="text-xl rounded-md border px-6 py-2">Your Reports</h2>
        <div className="flex max-h-[70%] items-center w-full overflow-auto flex-col gap-4">
          {reports.map((c: { id: Key | null | undefined }, i: number) => {
            return (
              <Link
                key={c.id}
                className="hover:underline"
                href={`/analyzedReports/${c.id}`}
              >
                {i + 1}. Report
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4">
        <UploadResultsModal />
        <p>Plan type - {planType}</p>
        {planType !== "Free" ? (
          ""
        ) : (
          <Link href="/pricing">
            <button className="items-start text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-l px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
              Upgrade Now
            </button>
          </Link>
        )}

        <p> {email}</p>
        <LogoutBtn />
      </div>
    </div>
  );
};
export default Sidebar;
export const dynamic = "force-dynamic";
