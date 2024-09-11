import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Sidebar from "./sidebar";
import UploadResultsModal from "./uploadResultsModal";
import ProcessLabResults from "./ProcessLabResults";
import Link from "next/link";
import Navbar from "../components/Navbar";
import fb from '../../public/icons8-facebook.svg'
import insta from '../../public/icons8-instagram.svg'
import x from '../../public/icons8-twitter.svg'
import tiktok from '../../public/icons8-tiktok.svg'
import youtube from '../../public/icons8-youtube.svg'
import Image from "next/image";
import Footer from "../components/Footer";

const HomePage = async () => {
  const session = await getServerSession()!;
  if (!session) redirect("/");

  return (
    <div className="  p-2 sm:p-0    bg-no-repeat bg-cover">
      <Navbar/>
      <Sidebar email={session.user?.email!} />
      <Footer/>
    </div>
  );
};
export default HomePage;
