"use client"
import React, { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';


function Sec4() {
  const controls = useAnimation();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
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
          
            <button onClick={openModal} className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
              Sign up
            </button>
         
        </motion.div>
      </motion.section>
        {/* Modal Implementation */}
        {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           exit={{ scale: 0.8, opacity: 0 }}
           transition={{
             type: "spring",
             stiffness: 860, // Control the bounciness
             damping: 20,    // Control the speed of the oscillation
             duration: 0.3,  // Optional: You can adjust this or remove if not needed with spring
           }}
            className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
          >
            <h3 className="text-2xl w-fit m-auto  font-semibold mb-4">Choose an Option</h3>
            <div className="flex flex-col max-w-[15rem] mx-auto   gap-4">
              <Link href="/register">
                <button className="text-[#ffffff] w-full active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
                  User
                </button>
              </Link>
              <Link href="/register/facility">
                <button className="text-[#ffffff] w-full active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition">
                  Facility
                </button>
              </Link>
              <button 
                onClick={closeModal}
                className="mt-4 text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
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