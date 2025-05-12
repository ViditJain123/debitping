"use client";

import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { FaWhatsapp, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* About Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-6">About DebitPing</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Built by a small team who hate chasing people for money. We&apos;re on a mission to automate awkward conversations
              and help businesses get paid faster.
            </p>
            <div className="flex justify-center space-x-4">
              {[FaTwitter, FaLinkedin, FaGithub].map((Icon, index) => (
                <a 
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold text-lg mb-4">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Integrations', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Blog', 'Documentation', 'Tutorials', 'Support'].map((item) => (
                <li key={item}>
                  <a 
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a 
                    href="#"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:hello@debitping.com"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  hello@debitping.com
                </a>
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Mumbai, India
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FaWhatsapp className="h-6 w-6 text-primary mr-2" />
              <span className="font-bold text-lg">DebitPing</span>
            </div>
            
            <p className="text-gray-500 text-sm flex items-center">
              &copy; {new Date().getFullYear()} DebitPing. All rights reserved. Made with <FiHeart className="mx-1 text-red-500" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
