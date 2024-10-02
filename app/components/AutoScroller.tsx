"use client"
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

const logos = [
  '/pngwing.com (1).png',
  '/pngwing.com (2).png',
  '/pngwing.com (3).png',
  '/pngwing.com (4).png',
  '/pngwing.com (5).png',
  '/pngwing.com (6).png',
  '/pngwing.com (7).png',
  '/pngwing.com.png',
  
  
];

const LogoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const visibleLogos = 5; // Number of logos to show at once
  const totalLogos = logos.length;

  const scrollNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (totalLogos + visibleLogos));
  };

  const scrollPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalLogos + visibleLogos) % (totalLogos + visibleLogos));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        scrollNext();
      }
    }, 2000);

    return () => clearInterval(interval);
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHovered]);

  useEffect(() => {
    if (currentIndex === totalLogos) {
      setTimeout(() => {
        setCurrentIndex(0);
        carouselRef.current!.style.transition = 'none'; // Disable transition temporarily
        carouselRef.current!.style.transform = `translateX(0%)`;
      }, 500); // Wait for the transition to complete before resetting
    } else {
      carouselRef.current!.style.transition = 'transform 0.5s ease';
    }
  }, [currentIndex, totalLogos]);

  return (
    <div className="relative w-full overflow-hidden  h-fit max-w-[100rem] mx-auto" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div
        ref={carouselRef}
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${(currentIndex * 100) / visibleLogos}%)` }}
      >
        {[...logos, ...logos.slice(0, visibleLogos)].map((logo, index) => (
          <div key={index} className="flex-none w-1/5 flex items-center justify-center">
            <Image src={logo} alt={`Logo ${index + 1}`} className="w-28 h-auto max-w-xs p-2" />
          </div>
        ))}
      </div>

      <button
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md focus:outline-none"
        onClick={scrollPrev}
      >
        &#8592;
      </button>
      <button
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md focus:outline-none"
        onClick={scrollNext}
      >
        &#8594;
      </button>
    </div>
  );
};

export default LogoCarousel;
