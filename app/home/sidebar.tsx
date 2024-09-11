import Image from "next/image";
import LogoutBtn from "../components/Logout";
import logo from "@/public/logo.png";
import Link from "next/link";
import prisma from "@/prisma";
import { getServerSession } from "next-auth";
import { MdEmail } from "react-icons/md";
import UploadResultsModal from "./uploadResultsModal";
import ProcessLabResults from "./ProcessLabResults";
const Sidebar = async ({ email }: { email: string }) => {
  const session = await getServerSession()!;
  const reports = await prisma.analyzedResult.findMany({
    where: { userEmail: session?.user?.email! },
  });
  return (
    <div className=" hidden py-6 sm:flex justify-between items-center flex-col bg-white text-black min-w-[200px] w-1/5 h-full mr-auto">

      <div className="space-y-4 h-full w-full mt-12 flex flex-col items-center">
        <h2 className="text-xl">Your Reports</h2>
        <div className="flex max-h-[70%] items-center w-full overflow-auto flex-col gap-4">
          {reports.map((c, i) => {
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
      <div className="flex flex-col items-center gap-4">
      <UploadResultsModal/>
      <ProcessLabResults/>
        <p>Plan type - Free</p>
        <Link href="/pricing" >
            <button className="items-start text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-l px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
              Upgrade Now
            </button>
          </Link>
        <p>Reports  left - 3</p>
        <p> {email}</p>
        <LogoutBtn />
        <div className="flex gap-3 items-center my-3">
          <MdEmail size={20} />
          <Link className="hover:underline" href="mailto:Info@deepware.org">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
export const dynamic = "force-dynamic";
