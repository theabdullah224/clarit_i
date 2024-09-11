"use client"
import React, { useEffect } from 'react'

import Image from "next/image";
import Link from "next/link";
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

function Sec2() {
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
    hidden: { opacity: 0, rotateY: 90 },
    visible: { opacity: 1, rotateY: 0 },
  };

  const rightVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div ref={ref}>
      <section className="max-w-[100rem] mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div 
          className="order-2 md:order-1 flex items-center justify-center md:justify-self-start"
         
        >
          <Image
            src="/2.png"
            alt="Clariti Health Report"
            width={600}
            height={400}
            className=""
          />
        </div>
        <motion.div 
          className="space-y-4 order-1 md:order-2"
          variants={rightVariants}
          initial="hidden"
          animate={controlsRight}
        >
          <h2 className="text-5xl font-bold ">Harness the latest AI Technology for Good</h2>
          
          <ul className="space-y-4 text-muted-foreground">
            {[
              {
                title: "Advanced Data Extraction",
                description: "We utilize the latest machine learning technology to extract detailed information from lab reports"
              },
              {
                title: "In-Depth Health Analyses",
                description: "Receive comprehensive health reports highlighting key biomarker signals"
              },
              {
                title: "Time-Saving Tools",
                description: "Save time with easy-to-interpret reports that fit seamlessly into your workflow"
              },
              {
                title: "Improved Patient Outcomes",
                description: "Provide your patients with the detailed care they deserve"
              },
            ].map((item, index) => (
              <motion.li key={index} className="flex items-start justify-start" variants={itemVariants}>
                <span className="text-black text-4xl leading-none mr-2 -mt-2">•</span>
                <div className="justify-center">
                  <span className="font-bold text-black">{item.title}</span>
                  <p className="mt-1 text-base">{item.description}</p>
                </div>
              </motion.li>
            ))}
          </ul>
          <motion.div className="flex space-x-4" variants={itemVariants}>
            {/* <UploadButton /> */}
            
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

export default Sec2