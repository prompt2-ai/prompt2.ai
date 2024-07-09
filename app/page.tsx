"use client";
import HeaderImage from "../public/header.jpg";
import Player from 'next-video/player';


export default function Home() {
  return (
<main className="lg:bg-gradient-to-b from-orange-300 to-orange-700 lg:shadow-2xl lg:p-32 w-full">
  <div className="z-10 md:flex items-center justify-center">
     <Player 
     src="https://prompt2.ai/headerVideo.mp4" 
     poster={HeaderImage.src}
     blurDataURL={HeaderImage.blurDataURL}
     className="lg:border-2 md:border-8 md:border-black lg:border-white"/>
  </div>
</main>
  );
}
