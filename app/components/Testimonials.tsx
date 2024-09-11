// // components/TestimonialCarousel.js
// "use client";
// import React, { useState } from "react";
// import Image from "next/image";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// const testimonials = [
//   {
//     name: "Doctor Testimonials",
//     image: "/profile.jpg",
//     review:
//       "Clariti has revolutionized the way I approach lab reports. My patients are more informed and satisfied with their care.",
//   },
//   {
//     name: "User Stories",
//     image: "/profile.jpg",
//     review:
//       "Using Clariti has given me peace of mind. I understand my health better and feel more in control.",
//   },
//   {
//     name: "Kim Smith",
//     image: "/profile.jpg",
//     review:
//       "Whenever my team has had any question or issue, Stratus has been there 24/7 to help right away. It's been a real breath of fresh air.",
//   },
//   {
//     name: "Kim Smith",
//     image: "/profile.jpg",
//     review:
//       "Whenever my team has had any question or issue, Stratus has been there 24/7 to help right away. It's been a real breath of fresh air.",
//   },
//   {
//     name: "Kim Smith",
//     image: "/profile.jpg",
//     review:
//       "Whenever my team has had any question or issue, Stratus has been there 24/7 to help right away. It's been a real breath of fresh air.",
//   },
//   {
//     name: "Kim Smith",
//     image: "/profile.jpg",
//     review:
//       "Whenever my team has had any question or issue, Stratus has been there 24/7 to help right away. It's been a real breath of fresh air.",
//   },
//   // Add more testimonials here...
// ];
// const TestimonialCarousel = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const nextSlide = () => {
//     setCurrentIndex((prevIndex) =>
//       Math.min(prevIndex + 3, testimonials.length - 3)
//     );
//   };

//   const prevSlide = () => {
//     setCurrentIndex((prevIndex) => Math.max(prevIndex - 3, 0));
//   };

//   const visibleTestimonials = testimonials.slice(
//     currentIndex,
//     currentIndex + 3
//   );

//   return (
//     <div className="bg-white py-16">
//       <div className=" mx-auto px-4 sm:px-6 lg:px-8 ">
//         <h2 className="text-5xl font-bold text-center text-navy mb-2">
//           What customers are saying
//         </h2>
//         <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto text-lg">
//           We've had the opportunity to work with some great customers over the
//           years, to help them streamline their processes and reach new heights.
//         </p>
//         <div className="relative m-auto max-w-[95rem]">
//           <div className="flex flex-col lg:flex-row gap-8  w-fit m-auto">
//             {visibleTestimonials.map((testimonial, index) => (
//               <div key={index} className="w-full lg:w-1/3  lg:max-w-[30rem] mx-auto flex  ">
//                 <div className="bg-white rounded-3xl shadow-lg p-12    lg:max-w-[30rem] flex flex-col items-center">
//                   <p className="text-gray-600 mb-6 text-base text-center">
//                     {testimonial.review}
//                   </p>
//                   <div className="flex items-center justify-center mt-auto">
//                     <Image
//                       style={{ borderRadius: "50%" }}
//                       src={testimonial.image}
//                       alt={testimonial.name}
//                       width={58}
//                       height={58}
//                       className=""
//                     />
//                     <div className="ml-4">
//                       <p className="font-semibold">{testimonial.name}</p>
//                       <p className="text-gray-500">Customer</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <button
//             onClick={prevSlide}
//             className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
//             disabled={currentIndex === 0}
//           >
//             <FaChevronLeft
//               className={`text-gray-600 ${
//                 currentIndex === 0 ? "opacity-50" : ""
//               }`}
//             />
//           </button>
//           <button
//             onClick={nextSlide}
//             className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
//             disabled={currentIndex >= testimonials.length - 3}
//           >
//             <FaChevronRight
//               className={`text-gray-600 ${
//                 currentIndex >= testimonials.length - 3 ? "opacity-50" : ""
//               }`}
//             />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TestimonialCarousel;

import Image from 'next/image';
import React from 'react';
import arrow from '../../public/arrow.png'
interface TestType {
  name: string;
  description: string;
  imageUrl: string;
}

const testTypes: TestType[] = [
  {
    name: "Blood Test",
    description: "Overall health, immune system, organ function, blood sugar levels, cholesterol, and more.",
    imageUrl: "/Blood Test.png"
  },
  {
    name: "Urine Test",
    description: "Kidney function, urinary tract infections, metabolic conditions, and dehydration.",
    imageUrl: "/Urine Test.png"
  },
  {
    name: "Swab Test",
    description: "Bacterial infections, viruses, fungal infections, and sexually transmitted infections (STIs).",
    imageUrl: "/Swab Test.png"
  },
  {
    name: "Stool Test",
    description: "Digestive conditions, infections, parasites, gut health, and colon cancer screening.",
    imageUrl: "/Stool Test.png"
  },
  {
    name: "Pap Smear",
    description: "Precancerous conditions, cervical cancer, HPV, and overall cervical health.",
    imageUrl: "/Pap Smear.png"
  },
  {
    name: "Semen Analysis",
    description: "Sperm count, motility, morphology, fertility issues, and male reproductive health.",
    imageUrl: "/Semen Analysis.png"
  },
  {
    name: "Hormone Test",
    description: "Thyroid function, reproductive hormones, adrenal function, and hormone imbalances.",
    imageUrl: "/Hormone Test.png"
  },
  {
    name: "Liver Function Test",
    description: "Liver enzymes, bilirubin levels, and overall liver health assessment.",
    imageUrl: "/Liver Function Test.png"
  },
  {
    name: "Kidney Function Test",
    description: "Creatinine, blood urea nitrogen (BUN), and glomerular filtration rate (GFR) for kidney health.",
    imageUrl: "/Kidney Function Test.png"
  }
];

const LabTestTypes: React.FC = () => {
  return (
    <div className="bg-white p-8 max-w-[100rem]  mx-auto">
      <div className='flex flex-col items-center justify-center'>

      <h1 className="text-5xl font-bold text-center mb-4">Supported Lab Test Types</h1>
      <p className="text-muted-foreground text-lg  mb-8">
        Discover the range of lab tests we support and analyze, empowering you to make informed health decisions.
      </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testTypes.map((test, index) => (
          <div key={index} className="border rounded-lg p-6 flex items-start space-x-4">
            <div className='flex items-center justify-center gap-4'>

            <img src={test.imageUrl} alt={test.name} className="w-16 h-16 object-contain" />
            <div>
              <h2 className="text-lg font-semibold">{test.name}</h2>
              <p className="text-sm text-gray-600">{test.description}</p>
            </div>
            </div>
         
              <Image src={arrow} alt="" />
           
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabTestTypes;
