

import React from 'react'
import Navbar from '@/components/Layout/Home_navbar'
import ExpertCategories from '@/components/HomePage/ExpertCategories'
import HeroHome from '@/components/ar/HeroHome'
import HowItWorks from '@/components/ar/HowItWorks'
import OurClientsSay from '@/components/ar/OurClientsSay'
import AchieveTheLook from '@/components/ar/AchieveTheLook'
import ConnectWithExpertCard from '@/components/ar/ConnectWithExpertCard'
import OurPartners from '@/components/HomePage/OurPartners'
import Footer from '@/components/Layout/Home_arbic_footer.jsx'
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