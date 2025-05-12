"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiInfo } from 'react-icons/fi';

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);
  
  const plans = [
    {
      name: "Free Trial",
      price: { monthly: 0, annual: 0 },
      description: "Try our services for one month",
      features: [
        "Free for one month",
        "Basic templates",
        "Excel file upload",
        "Up to 20 dealers"
      ],
      cta: "Start Free Trial",
      highlighted: false
    },
    {
      name: "Standard",
      price: { monthly: 700, annual: 7560 }, // 10% discount on annual
      description: "For distributors managing multiple dealers",
      features: [
        "Up to 100 dealers per distributor",
        "All templates",
        "Excel file upload",
        "Basic analytics",
        "Email support"
      ],
      cta: "Get Started",
      highlighted: true
    },
    {
      name: "Custom",
      price: { monthly: null, annual: null },
      description: "For larger businesses with custom needs",
      features: [
        "Unlimited dealers",
        "Custom templates",
        "Excel file upload",
        "Advanced analytics",
        "Priority support",
        "Dedicated account manager"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];
  
  return (
    <section id="pricing" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your needs
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center mt-8">
            <span className={`mr-3 ${annual ? 'text-gray-500' : 'font-medium'}`}>Monthly</span>
            <button 
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-gray-200 dark:bg-gray-700"
            >
              <span className="sr-only">Toggle billing period</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                  annual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="ml-3 flex items-center">
              <span className={annual ? 'font-medium' : 'text-gray-500'}>Yearly</span>
              <span className="ml-2 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                Save 10%
              </span>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative ${plan.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="px-3 text-xs font-semibold tracking-wide uppercase bg-primary text-white rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`h-full rounded-2xl overflow-hidden shadow-lg ${
                plan.highlighted 
                  ? 'border-2 border-primary dark:border-secondary' 
                  : 'border border-gray-200 dark:border-gray-700'
              }`}>
                <div className={`p-6 ${
                  plan.highlighted 
                    ? 'bg-primary/5 dark:bg-secondary/10' 
                    : 'bg-white dark:bg-gray-800'
                }`}>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    {plan.price.monthly !== null ? (
                      <>
                        <span className="text-4xl font-extrabold">
                          ₹{annual ? Math.round(plan.price.annual/12) : plan.price.monthly}
                        </span>
                        <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold">Custom Pricing</span>
                    )}
                  </div>
                  {annual && plan.price.annual !== null && (
                    <p className="mt-1 text-sm text-gray-500">
                      ₹{plan.price.annual} billed annually
                    </p>
                  )}
                  <p className="mt-4 text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700"></div>
                
                <div className="p-6 bg-white dark:bg-gray-800 space-y-4 h-full">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <FiCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-6">
                    <button
                      className={`w-full rounded-xl px-4 py-3 text-center font-medium shadow-sm ${
                        plan.highlighted
                          ? 'gradient-bg text-white hover:shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } transition-all`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
            <FiInfo className="h-4 w-4" />
            <span>Currently no direct API integrations to CRM and accounting software - Excel file upload available for all plans.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
