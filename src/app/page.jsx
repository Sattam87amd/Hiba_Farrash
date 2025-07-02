'use client'; // Add this if using App Router

// import React, { useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // or 'next/navigation' if using App Router
// import Navbar from '@/components/Layout/Navbar';
// import ExpertCategories from '@/components/HomePage/ExpertCategories';
// import HeroHome from '@/components/HomePage/HeroHome';
// import HowItWorks from '@/components/HomePage/HowItWorks';
// import OurClientsSay from '@/components/HomePage/OurClientsSay';
// import AchieveTheLook from '@/components/HomePage/AchieveTheLook';
// import ConnectWithExpertCard from '@/components/HomePage/ConnectWithExpertCard';
// import OurPartners from '@/components/HomePage/OurPartners';
// import Footer from '@/components/Layout/Footer';
// import ExpertsCardsBefore from '@/components/ExpertBeforeLogin/TopExpertsBefore';
// import WellnessBefore from '@/components/ExpertBeforeLogin/WellnessBefore';
// import FashionBeautyBefore from '@/components/ExpertBeforeLogin/Fasion&BeautyBefore';
// import CareerBusinessBefore from '@/components/ExpertBeforeLogin/Career&BusinessBefore';
// import HomeExpertsBefore from '@/components/ExpertBeforeLogin/HomeExpertBefore';
// import Chatbot from '@/components/HomePage/ChatBot';

// const Page = () => {
//   const router = useRouter();

//   useEffect(() => {
//     // Check for authentication tokens in localStorage
//     const checkAuth = () => {
//       try {
//         const userToken = localStorage.getItem('userToken');
//         const expertToken = localStorage.getItem('expertToken');
        
//         if (userToken) {
//           // If user token exists, redirect to user panel
//           router.replace('/userpanel/loginuserexpert');
//         } else if (expertToken) {
//           // If expert token exists, redirect to expert panel
//           router.replace('/expertpanel/expertpanelprofile');
//         }
//       } catch (error) {
//         console.error('Error checking authentication:', error);
//       }
//     };

//     // Run the check when component mounts
//     checkAuth();
//   }, [router]);

//   return (
//     <div>
//         <Navbar/>
//         <HeroHome/>
//         <HowItWorks/>
//         <ExpertCategories/>
//         <ExpertsCardsBefore/>
//         <OurClientsSay/>
//         <WellnessBefore/>
//         <FashionBeautyBefore/>
//         <CareerBusinessBefore/>
//         <HomeExpertsBefore/>
//         <AchieveTheLook/>
//         <ConnectWithExpertCard/>
//         <OurPartners/>
//         <Footer/>
//         <Chatbot />
//     </div>
//   );
// };

// export default Page;

import React from 'react'
import Navbar from '@/components/Layout/Navbar'
import ExpertCategories from '@/components/HomePage/ExpertCategories'
import HeroHome from '@/components/HomePage/HeroHome'
import HowItWorks from '@/components/HomePage/HowItWorks'
import OurClientsSay from '@/components/HomePage/OurClientsSay'
// import ExpertCard from '@/components/HomePage/TopExpert'
// import WellnessHomeCards from '@/components/HomePage/WellnessHomeCards'
// import FashionBeautyHomeCards from '@/components/HomePage/FashionBeautyHomeCards'
// import CareerBusinessHomeCards from '@/components/HomePage/CareerBusinessHomeCards'
// import HomeCards from '@/components/HomePage/HomeCards'
import AchieveTheLook from '@/components/HomePage/AchieveTheLook'
import ConnectWithExpertCard from '@/components/HomePage/ConnectWithExpertCard'
import OurPartners from '@/components/HomePage/OurPartners'
import Footer from '@/components/Layout/Footer'
import MobileNavSearch from '@/components/Layout/mobilenavsearch';

const page = () => {
  return (
    <div>
        <Navbar/>
    
        <HeroHome/>
        <HowItWorks/>
        {/* <ExpertCategories/> */}
        <OurClientsSay/>
        <AchieveTheLook/>
        <ConnectWithExpertCard/>
        <OurPartners/>
        <Footer/>
    </div>
  )
}

export default page