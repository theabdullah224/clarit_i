"use client"
import React, { useEffect } from 'react'

import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function Sec3() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const svgVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div ref={ref}>
      <motion.section 
        className="max-w-[100rem] mx-auto grid md:grid-cols-2 gap-8 items-center"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <div className="space-y-4">
          <motion.h2 className="text-5xl font-bold" variants={itemVariants}>
            Your health journey begins here
          </motion.h2>
          <motion.p className="text-muted-foreground text-lg" variants={itemVariants}>
            At Clariti, we believe in empowering individuals with the knowledge to understand their health better. Our advanced analytics engine provides personalized recommendations based on your unique health profile, via an in-depth health report with clear, actionable advice.
          </motion.p>
          <motion.ul className="grid gap-2 text-muted-foreground text-lg" variants={containerVariants}>
            {[
              "Your Lab Results, Explained",
              "Lifestyle Recommendations",
              "Dietary Suggestions",
              "What to ask your doctor on your next visit."
            ].map((item, index) => (
              <motion.li key={index} className="flex items-center gap-2" variants={listItemVariants}>
                <span className="text-black text-4xl leading-none mr-2">•</span>
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div className="flex space-x-4" variants={itemVariants}>
            {/* <UploadButton /> */}
            
          </motion.div>
        </div>
        <div 
          className="relative group flex items-center justify-center md:justify-self-end"
          
        >
          <Image
            src="/2.jpg"
            alt="Clariti Healthcare Integration"
            width={600}
            height={400}
            className=""
          />
          {/* <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M10 50 Q 25 25, 50 50 T 90 50"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
              variants={svgVariants}
            />
          </motion.svg> */}
        </div>
      </motion.section>
    </div>
  )
}

export default Sec3