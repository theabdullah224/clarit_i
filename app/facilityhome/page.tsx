// app/facilityhome/page.tsx

import FSec1 from "./FSec1";
import FSec2 from "./FSec2";
import FSec3 from "./FSec3";
import FSec4 from "./FSec4";
import Footer from "../components/Footer";
import Testimonials from '../components/Testimonials'

const FacilityHomePage = () => {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col">
      <main className="flex-1 py-12 px-4 md:px-6 lg:px-8 grid gap-12 relative -z-0">
        <FSec1 />
        <FSec2 />
        <FSec3 />
        <Testimonials/>
        <FSec4 />
      </main>
      <Footer />
    </div>
  );
};

export default FacilityHomePage;
