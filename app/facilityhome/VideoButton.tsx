import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import playicon from '../../public/playicon.svg';

const VideoButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  if (!isMounted) {
    return null; // or return a loading placeholder
  }

  return (
    <div className='relative z-50 '>

      <div className='flex gap-5 flex-row-reverse items-center'>
      <button onClick={openModal} className="focus:outline-none">
        <Image src={playicon} alt="Play video" className="w-12" />
      </button>
        <span className='font-bold text-lg'>Watch Video</span>
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full relative">
            <button 
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <video controls autoPlay className="w-full mt-6">
              <source src="/calariti video.mp4" type="video/mp4" />
            
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoButton;