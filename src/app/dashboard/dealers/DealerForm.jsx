'use client';

import { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

export default function DealerForm({ dealer = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: dealer.name || '',
    email: dealer.email || '',
    phone: dealer.phone || '',
    outstandingAmount: dealer.outstandingAmount || 0
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Dealer name is required';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    if (formData.phone && !/^[+\d\s()-]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Valid phone number is required';
    }
    
    if (isNaN(formData.outstandingAmount) || formData.outstandingAmount < 0) {
      newErrors.outstandingAmount = 'Valid amount is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        outstandingAmount: parseFloat(formData.outstandingAmount)
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dealer Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Enter dealer name"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Enter email address"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number
        </label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.phone ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="Enter phone number"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>
      
      <div>
        <label htmlFor="outstandingAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Outstanding Amount (₹)
        </label>
        <input
          type="number"
          id="outstandingAmount"
          name="outstandingAmount"
          value={formData.outstandingAmount}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.outstandingAmount ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        {errors.outstandingAmount && <p className="text-red-500 text-xs mt-1">{errors.outstandingAmount}</p>}
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <FiX className="inline-block mr-1 -mt-0.5" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm hover:shadow border border-primary hover:border-primary-dark transition-all cursor-pointer"
          >
            <FiSave className="inline-block mr-1 -mt-0.5" />
            Save Dealer
          </button>
      </div>
    </form>
  );
}
