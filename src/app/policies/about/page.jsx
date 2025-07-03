"use client";
import Footer from "@/components/Layout/Footer";
import Navbar from "@/components/Layout/Navbar";
import About from "@/components/Policies/About";
import React from "react";

const page = () => {
  return (
    <div className="w-screen h-screen overflow-x-hidden">
      <Navbar />
      <About />
      <Footer />
    </div>
  );
};

export default page;
