"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlayCircle } from 'react-icons/fi';

export default function DemoSection() {
  const [activeTemplate, setActiveTemplate] = useState(0);

  const templates = [
    {
      id: 1,
      title: "First Payment Reminder",
      message: "Hi John! This is a reminder that you have to pay ₹40,500 to M/S SuperSell Trading Company. Please clear it as soon as possible to avoid any complications."
    },
    {
      id: 2,
      title: "Second Follow-up",
      message: "Hello John, this is a follow-up reminder regarding your payment of ₹40,500 to M/S SuperSell Trading Company. It is now 7 days overdue. Please settle it as soon as possible."
    },
    {
      id: 3,
      title: "Final Notice",
      message: "IMPORTANT: Your payment of ₹40,500 to M/S SuperSell Trading Company is now 14 days overdue. Please settle immediately to avoid any further complications."
    }
  ];

  return (
    <section id="demo" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Live <span className="gradient-text">Demo Preview</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See what your customers will experience
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* WhatsApp preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/2"
          >
            <div className="bg-[#E5DDD5] rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto">
              {/* WhatsApp header */}
              <div className="bg-[#128C7E] text-white p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 mr-3 flex items-center justify-center">
                  <span className="font-bold">DP</span>
                </div>
                <div>
                  <p className="font-medium">DebitPing Assistant</p>
                  <p className="text-xs opacity-80">Online</p>
                </div>
              </div>
              
              {/* Chat body */}
              <div className="h-[400px] p-4 flex flex-col space-y-3 overflow-y-auto">
                {/* Date bubble */}
                <div className="self-center bg-white/70 rounded-full px-4 py-1 text-xs">
                  Today
                </div>
                
                {/* Message from DebitPing */}
                <div className="self-start max-w-[80%] bg-white rounded-lg p-3 shadow">
                  <p className="text-sm text-black">
                    {templates[activeTemplate].message}
                  </p>
                  <p className="text-[10px] text-gray-500 text-right mt-1">12:30 PM</p>
                </div>
              </div>
              
              {/* Input area */}
              <div className="bg-[#F0F0F0] p-3 flex items-center">
                <div className="bg-white rounded-full flex-1 h-10 px-4 flex items-center text-gray-400">
                  Type a message...
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Message templates */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-1/2 space-y-6"
          >
            <h3 className="text-2xl font-bold mb-6">Message Templates</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Choose from our library of pre-written templates or create custom ones for your business. Each message is designed to be friendly yet effective.
            </p>
            
            <div className="space-y-4">
              {templates.map((template, index) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    activeTemplate === index
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary/50"
                  }`}
                  onClick={() => setActiveTemplate(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.title}</h4>
                    {activeTemplate === index && (
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {template.message.substring(0, 50)}...
                  </p>
                </div>
              ))}
            </div>
            
            <button className="flex items-center gap-2 text-primary hover:text-primary-dark transition-colors">
              <FiPlayCircle className="w-5 h-5" />
              <span>See More Examples</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
