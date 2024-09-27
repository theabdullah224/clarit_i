import prisma from "@/prisma/index";

import { notFound, redirect } from "next/navigation";
import HomeBtn from "./HomeBtn";
import DownloadPDF from "./DownloadPDF";
import Sidebar from "./sidebar";
import { getServerSession } from "next-auth";
import Link from "next/link";

import Image from "next/image";
import Navbar from "@/app/components/Navbar";


const Page = async ({ params }: { params: { id: string } }) => {
  const session = await getServerSession()!;
  if (!session) redirect("/");

  const getanalyzedResult = async () => {
    const analyzedResults = await prisma.analyzedResult.findUnique({
      where: { id: params.id },
    });
    return analyzedResults;
  };

  const analyzedResults = await getanalyzedResult();
  if (!analyzedResults) notFound();

  return (
    <div className=" bg-muted  p-2 sm:p-0   bg-no-repeat bg-cover">
      <Navbar/>
      <div className="flex mx-11 my-6 gap-6">
      
      <Sidebar email={session.user?.email!} />
        
      <DownloadPDF analyzedresult={analyzedResults} />
      </div>
        
        <footer className="bg-muted text-muted-foreground py-6 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            
            <span className="text-sm font-medium">© 2024 Clariti. All rights reserved.</span>
          </div>
          {/* <div className="flex gap-4">
            <a href="https://www.tiktok.com/@moreclariti?_t=8p4ZYVe6eOb&_r=1" className="text-sm hover:underline" >
              <Image src={tiktok} alt="" className='w-6' />
            </a>
            <a href="https://www.facebook.com/moreclariti" className="text-sm hover:underline" >
              <Image src={fb} alt="" className='w-6 ' />
            </a>
            <a href="https://www.x.com/moreclariti/" className="text-sm hover:underline" >
              <Image src={x} alt="" className='w-6' />
            </a>
            <a href="https://www.youtube.com/@moreclariti" className="text-sm hover:underline" >
              <Image src={youtube} alt="" className='w-6' />
            </a>
            <a href="https://www.instagram.com/moreclariti/" className="text-sm hover:underline" >
              <Image src={insta} alt="" className='w-6' />
            </a>
            </div> */}
          <nav className="flex items-center gap-4 mt-4 md:mt-0">


            <div className=" flex  gap-4">

            
            <Link href="#" className="text-sm hover:underline" prefetch={false}>
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm hover:underline" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="mailto:Info@deepware.org" className="text-sm hover:underline" prefetch={false}>
              Contact Us
            </Link>
            </div>


            
          </nav>
        </footer>
      
    </div>
  );
};

// export async function generateMetadata({ params }: { params: { id: string} }) {
//   // You might want to set the locale here as well


//   const analyzedResults = await prisma.analyzedResults.findUnique({
//     where: { id: params.id },
//   });
//   return {
//     title: analyzedResults?.title || `Contract - ${analyzedResults?.id}`,
//     description: "Details of contract " + analyzedResults?.id,
//   };
// }

export default Page;