"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  const testimonials = [
    {
      id: 1,
      text: "Chasing clients for payments used to be awkward. DebtPing makes it effortless and has improved my cash flow dramatically.",
      name: "Rajiv M.",
      role: "Freelance Developer",
      avatar: "/avatars/avatar-1.png"
    },
    {
      id: 2,
      text: "I've reduced payment delays by 60% since using DebtPing. The automatic WhatsApp reminders are professional and get results.",
      name: "Priya S.",
      role: "Agency Owner",
      avatar: "/avatars/avatar-2.png"
    },
    {
      id: 3,
      text: "My clients appreciate the friendly reminders, and I appreciate not having to send them manually. Win-win!",
      name: "Arjun D.",
      role: "Consultant",
      avatar: "/avatars/avatar-3.png"
    }
  ];
  
  useEffect(() => {
    let interval;
    
    if (autoplay) {
      interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % testimonials.length);
      }, 5000);
    }
    
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);
  
  const handlePrev = () => {
    setAutoplay(false);
    setActiveIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  const handleNext = () => {
    setAutoplay(false);
    setActiveIndex(prev => (prev + 1) % testimonials.length);
  };
  
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="gradient-text">Customers</span> Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real results from real businesses
          </p>
        </motion.div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Testimonials Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-10">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-6">
                        {/* Quote marks */}
                        <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 32 32">
                          <path d="M10 8v8H6v-8h4zm0-2H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm12 2v8h-4v-8h4zm0-2h-4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
                        </svg>
                      </div>
                      
                      <p className="text-lg md:text-xl mb-8 font-medium">
                        &quot;{testimonial.text}&quot;
                      </p>
                      
                      <div className="w-20 h-20 mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative overflow-hidden">
                        {/* Using a placeholder for the avatar */}
                        <span className="text-2xl font-bold">{testimonial.name.charAt(0)}</span>
                      </div>
                      
                      <h3 className="font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <button 
            onClick={handlePrev}
            className="absolute top-1/2 -left-4 md:-left-8 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center z-10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous testimonial"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute top-1/2 -right-4 md:-right-8 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center z-10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next testimonial"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
          
          {/* Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button 
                key={index}
                onClick={() => {
                  setAutoplay(false);
                  setActiveIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
