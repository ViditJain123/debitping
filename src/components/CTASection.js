"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      // In a real app, you would send this to your backend
    }, 1500);
  };
  
  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-primary to-secondary rounded-3xl overflow-hidden shadow-xl"
          >
            <div className="px-6 py-12 md:px-12 md:py-16 text-white">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Get Early Access Before We Launch
                </h2>
                <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
                  Be among the first to revolutionize your payment collection process with DebitPing.
                </p>
              </div>
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="block w-full pl-10 pr-3 py-3 rounded-xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-primary bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary shadow-md transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <>
                          Get Started <FiArrowRight className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                  {error && (
                    <p className="mt-2 text-red-200 text-sm">{error}</p>
                  )}
                  <p className="mt-3 text-sm text-white/80 text-center">
                    We&apos;ll notify you once you&apos;re in
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                    <FiCheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Thank you for joining!</h3>
                  <p className="text-white/90">
                    We&apos;ve added you to our waitlist. We&apos;ll be in touch soon when early access is ready.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
