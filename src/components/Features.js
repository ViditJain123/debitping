"use client";

import { motion } from 'framer-motion';
import { 
  FiClock, 
  FiLink, 
  FiFileText, 
  FiLock 
} from 'react-icons/fi';

export default function Features() {
  const features = [
    {
      id: 1,
      icon: <FiClock className="w-6 h-6" />,
      title: "Auto-Reminders",
      description: "Automatically send payment reminders on schedule based on your preferences.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      id: 5,
      icon: <FiFileText className="w-6 h-6" />,
      title: "Templates Library",
      description: "Choose from a variety of ready-to-use WhatsApp message templates.",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: 6,
      icon: <FiLock className="w-6 h-6" />,
      title: "End-to-End Encryption",
      description: "Your data stays secure with enterprise-level encryption protocols.",
      color: "from-indigo-500 to-blue-500",
    },
  ];
  
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful <span className="gradient-text">Features</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to streamline your payment collection process
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`card-hover ${index === features.length - 1 && features.length % 2 !== 0 ? 'md:col-span-2 md:mx-auto md:max-w-md' : ''}`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 h-full flex flex-col">
                <div className={`w-12 h-12 mb-6 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
