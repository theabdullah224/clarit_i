"use client"
import React, { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';


function Sec4() {
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

  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 5 + 1,
    }));
   
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.5,
        duration: 0.8,
      },
    },
  };

  const buttonVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: {
        delay: 1,
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0px 0px 8px rgb(255,255,255)",
      transition: {
        duration: 0.3,
        yoyo: Infinity,
      },
    },
  };

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.section 
        className="max-w-[100rem] mx-auto text-center space-y-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.h2 className="text-3xl font-bold" variants={titleVariants}>
          {Array.from("Get Started with Clariti").map((letter, index) => (
            <motion.span key={index} variants={letterVariants}>
              {letter}
            </motion.span>
          ))}
        </motion.h2>
        <motion.p 
          className="text-muted-foreground text-lg"
          variants={subtitleVariants}
        >
          Sign up today and start unlocking your personal health insights.
        </motion.p>
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
        >
          <Link href="/signup" className='mt-4'>
            <button className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
              Sign up
            </button>
          </Link>
        </motion.div>
      </motion.section>
      {/* <div className="absolute inset-0 z-0">
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-blue-500 opacity-30"
            style={{
              width: particle.size,
              height: particle.size,
              x: particle.x,
              y: particle.y,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div> */}
    </div>
  )
}

export default Sec4