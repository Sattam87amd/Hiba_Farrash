import React from 'react';

export default function About() {
  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 px-4 pt-8 pb-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 md:p-10 mt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          About Us
        </h1>
        <div className="space-y-8 text-center">
          <section className="space-y-6">
            <h2 className="text-4xl font-semibold">
              Welcome to Shourk
            </h2>
            <p className="text-gray-700 text-xl">
              Empowering students with future-ready skills through innovative education solutions.
            </p>
          </section>
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">
              Why Choose Shourk?
            </h2>
            <div className="text-left space-y-4">
              <h3 className="text-2xl font-semibold">
                Mission-Driven
              </h3>
              <ul className="list-disc list-inside text-gray-700 text-lg">
                <li>Focused on equipping students with industry-relevant skills for a competitive edge.</li>
                <li>Dedicated to preparing learners for a brighter and more successful future.</li>
              </ul>
            </div>
            <div className="text-left space-y-4">
              <h3 className="text-2xl font-semibold">
                Comprehensive Programs
              </h3>
              <p className="text-gray-700 text-lg">Specialized courses in:</p>
              <ul className="list-disc list-inside text-gray-700 text-lg ml-4">
                <li><strong>Coding:</strong> Master programming and software development.</li>
                <li><strong>Market Intelligence:</strong> Develop data-driven decision-making skills.</li>
                <li><strong>Growth-Centric Training:</strong> Cultivate personal and professional growth.</li>
              </ul>
            </div>
            <div className="text-left space-y-4">
              <h3 className="text-2xl font-semibold">
                Innovative Learning Approach
              </h3>
              <ul className="list-disc list-inside text-gray-700 text-lg">
                <li><strong>Inclusive:</strong> Accessible to students from diverse backgrounds.</li>
                <li><strong>Results-Oriented:</strong> Designed for measurable success and career impact.</li>
                <li><strong>Tailored Solutions:</strong> Courses aligned with industry demands and real-world applications.</li>
              </ul>
            </div>
            <div className="text-left space-y-4">
              <h3 className="text-2xl font-semibold">
                Expert Support Team
              </h3>
              <ul className="list-disc list-inside text-gray-700 text-lg">
                <li>A passionate team committed to guiding students every step of the way.</li>
                <li>Ongoing mentorship to unlock potential and ensure success.</li>
              </ul>
            </div>
          </section>
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">
              Join the Revolution
            </h2>
            <p className="text-gray-700 text-lg">
              Become a part of the education transformation with Shourk and take the first step towards a brighter,
              future-ready career.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

