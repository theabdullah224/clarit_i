import { getServerSession } from "next-auth";
import Navbar from "../components/Navbar";
import PricingClient from  "./PricingClient"
import Image from 'next/image'
import fb from '../../public/icons8-facebook.svg'
import insta from '../../public/icons8-instagram.svg'
import x from '../../public/icons8-twitter.svg'
import tiktok from '../../public/icons8-tiktok.svg'
import youtube from '../../public/icons8-youtube.svg'
import Link from "next/link";
import Footer from "../components/Footer";

const Page = async () => {
  const session = await getServerSession();
  const user = session?.user?.email || null;

  return (
    <>
      <Navbar />
      
      <div className="mx-auto mb-10 sm:max-w-xl flex flex-col items-center justify-center  ">
        <h1 className="text-6xl text-center font-bold sm:text-7xl   ">Plans & Pricing</h1>
       
       
      </div>
      <div className="mb-14 max-w-[100rem] mx-auto">

      <PricingClient user={user} />
      </div>
      <Footer/>
    </>
  );
};

export default Page;