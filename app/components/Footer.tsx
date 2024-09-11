import React from 'react'
import fb from '../../public/icons8-facebook.svg'
import insta from '../../public/icons8-instagram.svg'
import x from '../../public/icons8-twitter.svg'
import tiktok from '../../public/icons8-tiktok.svg'
import youtube from '../../public/icons8-youtube.svg'
import Image from "next/image";
import Link from 'next/link'
import { Instagram, Facebook, Twitter,Youtube,Activity } from "lucide-react";

function Footer() {
  return (
    <div>
           <footer className="bg-muted text-muted-foreground py-6 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            
            <span className="text-sm font-medium">© 2024 Clariti. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <a href="https://www.tiktok.com/@moreclariti?_t=8p4ZYVe6eOb&_r=1" className="text-sm hover:underline" >
            <Activity className="h-6 w-6 text-[#737373]" />
            </a>
            <a href="https://www.facebook.com/moreclariti" className="text-sm hover:underline" >
              {/* <Image src={fb} alt="" className='w-6 ' /> */}
              <Facebook className="h-6 w-6 text-[#737373]" />
            </a>
            <a href="https://www.x.com/moreclariti/" className="text-sm hover:underline" >
            <Twitter className="h-6 w-6 text-[#737373]" />
            </a>
            <a href="https://www.youtube.com/@moreclariti" className="text-sm hover:underline" >
            <Youtube className="h-6 w-6 text-[#737373]" />
            </a>
            <a href="https://www.instagram.com/moreclariti/" className="text-sm hover:underline" >
            <Instagram className="h-6 w-6 text-[#737373]" />
            </a>
            </div>
          <nav className="flex items-center gap-4 mt-4 md:mt-0">


            <div className=" flex  gap-4">

            
            <Link href="#" className="text-sm hover:underline" prefetch={false}>
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm hover:underline" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:underline" prefetch={false}>
              Contact Us
            </Link>
            </div>


            
          </nav>
        </footer>
    </div>
  )
}

export default Footer
