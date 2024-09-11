import React, { SVGProps } from 'react'
import FAQS from '../components/FAQS'
import Navbar from '../components/Navbar'
import TestimonialCarousel from '../components/Testimonials'
import AutoScroller from '../components/AutoScroller'
import Sec4 from '../components/Sec4'
import Link from "next/link";
import Image from 'next/image'
import fb from '../../public/icons8-facebook.svg'
import insta from '../../public/icons8-instagram.svg'
import x from '../../public/icons8-twitter.svg'
import tiktok from '../../public/icons8-tiktok.svg'
import youtube from '../../public/icons8-youtube.svg'
import Footer from '../components/Footer'
function page() {
  return (
    <div className=''>
        <Navbar/>
        <FAQS/>
        {/* <TestimonialCarousel/> */}
        {/* <AutoScroller/> */}
        {/* <Sec4/> */}
        <Footer/>
    </div>
  )
}

export default page

