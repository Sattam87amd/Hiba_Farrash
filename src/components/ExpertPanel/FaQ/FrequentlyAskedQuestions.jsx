"use client";
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-4 md:py-6">
      {/* Question + Toggle Icon */}
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={() => setOpen(!open)}
      >
        <span className="text-lg md:text-3xl font-medium text-[#1A1A1A]">
          {question}
        </span>
        {open ? <FaChevronUp className="text-base md:text-lg text-[#1A1A1A]" /> : <FaChevronDown className="text-base md:text-lg" />}
      </button>

      {/* Answer */}
      {open && (
        <p className="mt-3 text-gray-600 text-base md:text-lg leading-relaxed md:leading-loose">
          {answer}
        </p>
      )}
    </div>
  );
}

function FrequentlyAskedQuestions() {
  const faqs = [
    {
      question: "How does it work?",
      answer:
        "Simply browse our list of experts, book a session at your preferred time, make the payment, and connect via a secure video call.",
    },
    {
      question: "Who are the experts on the platform?",
      answer:
        "Our platform hosts a range of professionals from various industries, all vetted for their expertise and experience.",
    },
    {
      question: "How do I book a session?",
      answer:
        "Select an expert, choose a suitable time from their calendar, and complete your booking by making a secure payment.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit cards, debit cards, and PayPal. Additional local payment options may be available depending on your region.",
    },
    {
      question: "Can I reschedule or cancel a session?",
      answer:
        "Yes, you can modify or cancel your session up to 24 hours before it starts. Check our cancellation policy for more details.",
    },
    {
      question: "What happens if an expert cancels my session?",
      answer:
        "If an expert cancels, you’ll be notified immediately and given the option to reschedule or receive a full refund.",
    },
    {
      question: "How do I join my booked session?",
      answer:
        "After booking, you’ll receive a unique link or access code to join the secure video call at your scheduled time.",
    },
    {
      question: "What if I have technical issues during the call?",
      answer:
        "If you encounter any technical difficulties, please contact our support team immediately. We’ll do our best to help you troubleshoot or reschedule if needed.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      {/* Centered Heading */}
      <h2 className="text-3xl md:text-6xl md:py-20 font-semibold text-center mb-12">
        Frequently Asked Questions
      </h2>

      {/* FAQ Grid (2 Columns on MD and above) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mx-9">
        {/* Left Column (first half of FAQs) */}
        <div>
          {faqs.slice(0, 4).map((item, idx) => (
            <FAQItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>

        {/* Right Column (second half of FAQs) */}
        <div>
          {faqs.slice(4).map((item, idx) => (
            <FAQItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FrequentlyAskedQuestions;
