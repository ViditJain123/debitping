"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function IntegrationsSection() {
  const integrations = [
    {
      name: "QuickBooks",
      logo: "/logos/quickbooks.svg",
      delay: 0
    },
    {
      name: "Zoho",
      logo: "/logos/zoho.svg",
      delay: 0.1
    },
    {
      name: "FreshBooks",
      logo: "/logos/freshbooks.svg", 
      delay: 0.2
    },
    {
      name: "Razorpay",
      logo: "/logos/razorpay.svg",
      delay: 0.3
    },
    {
      name: "DALL·E",
      logo: "/logos/dalle.svg",
      delay: 0.4
    },
    {
      name: "Notion",
      logo: "/logos/notion.svg",
      delay: 0.5
    },
    {
      name: "Zapier",
      logo: "/logos/zapier.svg",
      delay: 0.6
    }
  ];
  
  return (
    <section id="integrations" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Seamless <span className="gradient-text">Integrations</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Plug DebitPing into the tools you already use
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-8">
          {integrations.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: item.delay }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col items-center justify-center aspect-square"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 relative mb-3">
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {/* Note: In a real implementation, you'd have actual SVG logos */}
                  {item.name.charAt(0)}
                </div>
              </div>
              <p className="text-sm font-medium text-center">{item.name}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Don&apos;t see your tool? <a href="#contact" className="text-primary hover:underline">Request an integration</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
