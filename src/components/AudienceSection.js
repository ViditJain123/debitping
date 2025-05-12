"use client";

import { motion } from 'framer-motion';
import { FiUser, FiUsers, FiBriefcase, FiHome } from 'react-icons/fi';

export default function AudienceSection() {
  const audiences = [
    {
      icon: <FiUser className="w-6 h-6" />,
      title: "Freelancers",
      painPoint: "Spending hours following up on invoices",
      solution: "Schedule automatic reminders while you focus on client work"
    },
    {
      icon: <FiBriefcase className="w-6 h-6" />,
      title: "Accountants",
      painPoint: "Managing payments for multiple clients",
      solution: "Streamline collection and get notifications when clients pay"
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Agencies",
      painPoint: "Awkward payment conversations with clients",
      solution: "Let automated messages handle reminders professionally"
    },
    {
      icon: <FiHome className="w-6 h-6" />,
      title: "Small Business Owners",
      painPoint: "Cash flow issues from late payments",
      solution: "Reduce payment delays with timely WhatsApp reminders"
    }
  ];
  
  return (
    <section id="audience" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Who It&apos;s <span className="gradient-text">For</span></h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            DebitPing helps a variety of professionals collect payments faster
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {audiences.map((audience, index) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-hover"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-6 rounded-full gradient-bg flex items-center justify-center text-white">
                  {audience.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{audience.title}</h3>
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg p-3 mb-4 w-full">
                  <p className="text-sm">{audience.painPoint}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg p-3 w-full">
                  <p className="text-sm">{audience.solution}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
