"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLink, FiSettings, FiPlayCircle } from 'react-icons/fi';

export default function HowItWorks() {
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const steps = [
    {
      id: 1,
      title: 'Export Excel file from your Accounting software',
      description: 'Integrate with QuickBooks, Zoho, or any custom system.',
      icon: <FiLink className="w-8 h-8" />,
    },
    {
      id: 2,
      title: 'Set Smart Rules',
      description: 'Choose when and how reminders are sent.',
      icon: <FiSettings className="w-8 h-8" />,
    },
    {
      id: 3,
      title: 'Let It Run',
      description: 'Automated, personalized messages on WhatsApp.',
      icon: <FiPlayCircle className="w-8 h-8" />,
    }
  ];
  
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Automating payment reminders has never been easier
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-hover"
              onMouseEnter={() => setHoveredCard(step.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 h-full flex flex-col items-center text-center">
                <motion.div 
                  className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center text-white mb-6"
                  animate={{
                    scale: hoveredCard === step.id ? 1.1 : 1,
                    rotate: hoveredCard === step.id ? 5 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {step.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                
                {/* Step indicator */}
                <div className="mt-6 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-medium">
                    {step.id}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
