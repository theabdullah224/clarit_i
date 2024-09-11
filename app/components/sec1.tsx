"use client"
import React, { useEffect,useRef } from 'react'
import playicon from '../../public/playicon.svg'


import Image from "next/image";

import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import VideoButton from './VideoButton';

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
          <h2 className="text-5xl font-bold">Discover the Future of Health Analysis with Clariti</h2>
          <p className="text-muted-foreground text-lg">
          Simply upload your lab results, and our advanced AI and Machine Learning algorithms will extract the necessary data to provide you with a comprehensive health analysis. Clariti delivers a detailed health report, complete with actionable recommendations tailored just for you. We believe in empowering individuals with the knowledge to understand their health better.
          </p>
          <div className="flex gap-4  justify-between items-start pt-4">
          <Link href="/signup" className=''>
            <button className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
              Upload Lab Results
            </button>
          </Link>
          <div>
            <VideoButton/>
          </div>
            
          </div>
        </motion.div>
        <div 
          className="relative group flex items-center justify-center md:justify-self-end -z-10"
          
        >
          <Image
            src="/4.png"
            alt="Clariti Dashboard"
            width={600}
            height={400}
            className=""
          />
          <div className="absolute inset-0 bg-gradient-to-t rounded-lg -z-10" />
        </div>
      </section>
    </div>
  )
}

export default Sec1