"use client";
import React, { useEffect, useRef } from "react";
import playicon from "../../public/playicon.svg";
import VideoButton from "./VideoButton";

import Image from "next/image";

import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
// import VideoButton from './VideoButton';

function Sec1() {
  const controlsLeft = useAnimation();
  const controlsRight = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      controlsLeft.start("visible");
      controlsRight.start("visible");
    } else {
      controlsLeft.start("hidden");
      controlsRight.start("hidden");
    }
  }, [controlsLeft, controlsRight, inView]);

  const leftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  };

  const rightVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div ref={ref}>
      <section className="max-w-[100rem]  mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          className="space-y-4"
          variants={leftVariants}
          initial="hidden"
          animate={controlsLeft}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-5xl font-bold">
            Elevate Your Healthcare Facility with Clariti
          </h2>
          <p className="text-muted-foreground text-lg">
            Clariti offers clear interpretations for your patients lab reports.
            We empower healthcare providers to make informed decisions to
            improve patient outcomes with evidence-based insights.
          </p>
          <div className="flex gap-4 justify-between items-start pt-4">
            {/* <Link href="/register/facility" className=''>
            <button className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
              Upload Lab Results
            </button>
          </Link> */}

          <div className="flex gap-2">
            <Link
              href="https://calendly.com/firstresponders/clariti-live-demo"
              className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition"
              >
              Book a 1:1 Call
            </Link>
            <Link href="/register/facility" className="">
              <button className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
                Signup
              </button>
            </Link>
              </div>
            <div>
              <VideoButton />
            </div>
          </div>
        </motion.div>
        <div className="relative group flex items-center justify-center md:justify-self-end -z-10">
          <Image
            src="/3.png"
            alt="Clariti Dashboard"
            width={600}
            height={400}
            className=""
          />
          <div className="absolute inset-0 bg-gradient-to-t rounded-lg -z-10" />
        </div>
      </section>
    </div>
  );
}

export default Sec1;
