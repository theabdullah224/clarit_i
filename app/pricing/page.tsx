// app/pricing/page.tsx

import { getServerSession } from "next-auth";
import PricingClient from "./PricingClient";
import Footer from "../components/Footer";
import { authOptions } from "../api/auth/[...nextauth]";

const PricingPage = async () => {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || null;

  return (
    <>
      <div className="mx-auto mb-10 sm:max-w-xl flex flex-col items-center justify-center">
        <h1 className="text-6xl text-center font-bold sm:text-7xl">Plans & Pricing</h1>
      </div>
      <div className="mb-14 max-w-[100rem] mx-auto">
      <PricingClient user={{ id: session?.user.id!, role: session?.user.role }} />

      </div>
      <Footer />
    </>
  );
};

export default PricingPage;
