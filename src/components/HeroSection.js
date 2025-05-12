"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBolt } from 'react-icons/fa';

export default function HeroSection() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Never Chase Payments <span className="gradient-text">Again    </span> <br />
              Automate It with DebtPing
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg">
              Connect your accounting tools and let WhatsApp follow up on your overdue payments automatically.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="#contact"
                className="px-6 py-3 text-center text-white font-medium rounded-2xl gradient-bg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                Get Started
              </Link>
              
              <Link
                href="#demo"
                className="px-6 py-3 text-center font-medium border border-gray-300 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                See It in Action
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mt-8 pt-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
                <FaBolt className="text-yellow-500" />
                <span className="text-sm font-medium">Powered by OpenAI</span>
              </div>
            </div>
          </motion.div>
          
          {/* Right content - Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[400px] md:h-[500px] w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl overflow-hidden flex items-center justify-center">
              {/* Replace with actual WhatsApp chat mockup */}
              <div className="w-[300px] h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                {/* WhatsApp header */}
                <div className="bg-[#128C7E] text-white p-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 mr-3 flex items-center justify-center">
                    <span className="font-bold">DP</span>
                  </div>
                  <div>
                    <p className="font-medium">DebtPing Assistant</p>
                    <p className="text-xs opacity-80">Online</p>
                  </div>
                </div>
                
                {/* Chat messages */}
                <div className="flex-1 bg-[#E5DDD5] p-3 flex flex-col space-y-2 overflow-y-auto">
                  {/* Message bubbles */}
                  <div className="self-start max-w-[85%] bg-white rounded-lg p-3 shadow">
                    <p className="text-sm text-black">Hi John! This is a reminder that you have to pay ₹40,500 to M/S SuperSell Trading Company. Please clear it as soon as possible to avoid any complications.</p>
                  </div>
                  
                  <div className="self-end max-w-[80%] bg-[#DCF8C6] rounded-lg p-2 shadow mt-3">
                    <p className="text-sm text-black">Thanks for the reminder! I&apos;ll make the payment today.</p>
                  </div>
                </div>
                
                {/* Input area */}
                <div className="bg-white p-3 flex items-center">
                  <div className="bg-gray-100 rounded-full flex-1 h-10"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
