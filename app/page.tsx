import Navbar from "./components/Navbar";
import Sec1 from "./components/sec1";
import Sec2 from "./components/Sec2";
import Sec3 from "./components/Sec3";
import Testimonials from "./components/Testimonials";
import AutoScroller from "./components/AutoScroller";
import Sec4 from "./components/Sec4";
import Footer from "./components/Footer";

export default async function Home() {
  return (
    <div className="w-full min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 md:px-6 lg:px-8 grid gap-12 relative -z-0 ">
        <Sec1 />

        <Sec2 />

        <Sec3 />

        <Testimonials />

        <AutoScroller />

        <Sec4 />
      </main>

      <Footer />
    </div>
  );
}
