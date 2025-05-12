"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  
  const faqs = [
    {
      question: "Is WhatsApp messaging legal for payments?",
      answer: "Yes, sending payment reminders through WhatsApp is legal as long as you comply with WhatsApp Business policies and get proper consent from your customers. DebtPing ensures all communications follow best practices and regulations."
    },
    {
      question: "Will customers get spammed?",
      answer: "No, DebtPing allows you to set reasonable reminder frequencies and customize messaging schedules. Customers will only receive relevant, professional payment reminders based on your settings."
    },
    {
      question: "Can I personalize messages?",
      answer: "Absolutely! You can customize message templates with your branding, tone, and specific payment details. Our AI-powered system can even suggest effective messaging based on your business type and customer relationships."
    },
    {
      question: "How secure is my data?",
      answer: "We take security seriously. All your financial and customer data is encrypted with bank-level security. We never store actual payment details, only the metadata needed for reminders. We're fully GDPR compliant and never share your data with third parties."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees. If you cancel, you'll have access until the end of your billing period."
    },
    {
      question: "Do I need coding knowledge?",
      answer: "Not at all! DebtPing is designed to be user-friendly with an intuitive dashboard. You can set up your account, integrate your accounting tools, and start sending reminders within minutes without any technical expertise."
    }
  ];
  
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about DebtPing
          </p>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="mb-4"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className={`flex justify-between items-center w-full p-5 text-left rounded-xl ${
                  openIndex === index 
                    ? 'bg-primary/10 dark:bg-primary/20' 
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                } transition-colors shadow-sm`}
              >
                <h3 className="text-lg font-medium">{faq.question}</h3>
                {openIndex === index ? (
                  <FiChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <FiChevronDown className="h-5 w-5" />
                )}
              </button>
              
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border-t border-gray-100 dark:border-gray-700"
                >
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Still have questions? <a href="#contact" className="text-primary hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </section>
  );
}
