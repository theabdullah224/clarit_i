import prisma from "@/prisma/index";
import DeleteBtn from "./DeleteBtn";
import { notFound } from "next/navigation";
import HomeBtn from "./HomeBtn";
import DownloadPDF from "./DownloadPDF";

const page = async ({ params }: { params: { id: string } }) => {
  const getanalyzedResult = async () => {
    const analyzedResult = await prisma.analyzedResult.findUnique({
      where: { id: params.id },
    });
    return analyzedResult;
  };

  const analyzedResult = await getanalyzedResult();
  if (!analyzedResult) notFound();

  return (
    <div className="p-5 md:p-10 text-lg text-black ">
      <div className="w-[80%] mx-auto">
        
        <DownloadPDF contract={analyzedResult} />
        <div className="flex items-center flex-row gap-4">
          <DeleteBtn contractId={params.id} />
          <HomeBtn />
        </div>
      </div>
      
    </div>
  );
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
  });
  return {
    title: contract?.title || `contract - ${contract?.id}`,
    description: "Details of issue" + contract?.id,
  };
}

export default page;
