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
            src="/1.png"
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
          <h2 className="text-5xl font-bold">How it works</h2>
          <p className="text-muted-foreground text-lg">
            Clariti's tools and insights enhance the services provided by your healthcare providers, helping you and your care team make more informed decisions.
          </p>
          <ul className="space-y-4 text-muted-foreground">
            {[
              {
                title: "Upload Your Lab Results",
                description: "Simply upload your lab test image or pdf, and our platform will automatically extract the relevant data."
              },
              {
                title: "Receive Personalized Insights",
                description: "Our advanced algorithms analyze your lab results and provide you with a comprehensive health report, including personalized recommendations."
              },
              {
                title: "Share with Your Providers",
                description: "Easily share your health insights with your healthcare providers to enhance their services and improve your overall care."
              }
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