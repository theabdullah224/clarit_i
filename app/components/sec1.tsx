"use client";
import React, { useEffect, useRef, useState } from 'react';
import playicon from '../../public/playicon.svg';
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

  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Handler to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
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
            {/* Button to open the modal instead of directly linking */}
            <div className='flex gap-4'>

            <button 
              onClick={openModal}
              className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition"
              >
              Upload Lab Results
            </button>
            <button 
              onClick={openModal}
              className="text-[#ffffff] active:bg-[#ffffff] bg-[#000000] border border-[#000000]  text-xl px-4 md:px-6 py-2 font-semibold rounded-lg hover:bg-[#ffffff] hover:text-black transition"
              >
              Sign Up
            </button>
              </div>
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
    </div>
  );
}

export default Sec1;
