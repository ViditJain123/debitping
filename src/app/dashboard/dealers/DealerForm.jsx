'use client';

import { useState } from 'react';
import { FiSave, FiX, FiPlusCircle, FiTrash2 } from 'react-icons/fi';

export default function DealerForm({ dealer = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: dealer.name || '',
    phone: dealer.phone || '',
    outstandingAmount: dealer.outstandingAmount || 0,
    outstandingBills: dealer.outstandingBills || [{ billNumber: '', billDate: '', billAmount: 0 }]
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
  
  // Handle changes to outstanding bills
  const handleBillChange = (index, field, value) => {
    const updatedBills = [...formData.outstandingBills];
    updatedBills[index] = { ...updatedBills[index], [field]: value };
    setFormData({ ...formData, outstandingBills: updatedBills });
    
    // Clear errors
    if (errors[`bills.${index}.${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`bills.${index}.${field}`];
      setErrors(newErrors);
    }
  };
  
  // Add a new bill row
  const addBill = () => {
    setFormData({
      ...formData,
      outstandingBills: [...formData.outstandingBills, { billNumber: '', billDate: '', billAmount: 0 }]
    });
  };
  
  // Remove a bill row
  const removeBill = (index) => {
    const updatedBills = [...formData.outstandingBills];
    updatedBills.splice(index, 1);
    setFormData({ ...formData, outstandingBills: updatedBills });
    
    // Remove any errors for this bill
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`bills.${index}.`)) {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);
  };
  
  // Format phone number to E.164 format
  const formatE164PhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters except the + sign
    const stripped = phoneNumber.replace(/[^\d+]/g, '');
    
    // Ensure it starts with a + sign
    if (!stripped.startsWith('+')) {
      return '+' + stripped;
    }
    
    return stripped;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Dealer name is required';
    }
    
    // Validate phone: must contain at least 10 digits
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Valid phone number with at least 10 digits is required';
    }
    
    if (isNaN(formData.outstandingAmount) || formData.outstandingAmount < 0) {
      newErrors.outstandingAmount = 'Valid amount is required';
    }
    
    // Validate bills
    formData.outstandingBills.forEach((bill, index) => {
      // If any field is filled, all fields become required
      const hasSomeBillData = bill.billNumber || bill.billDate || bill.billAmount > 0;
      
      if (hasSomeBillData) {
        if (!bill.billNumber) {
          newErrors[`bills.${index}.billNumber`] = 'Bill number is required';
        }
        
        if (!bill.billDate) {
          newErrors[`bills.${index}.billDate`] = 'Bill date is required';
        } else {
          // Check if it's a valid date
          const isValidDate = !isNaN(new Date(bill.billDate).getTime());
          if (!isValidDate) {
            newErrors[`bills.${index}.billDate`] = 'Invalid date format';
          }
        }
        
        if (isNaN(bill.billAmount) || bill.billAmount <= 0) {
          newErrors[`bills.${index}.billAmount`] = 'Valid amount is required';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Format the phone number to E.164 format before submitting
      const formattedPhone = formatE164PhoneNumber(formData.phone);
      
      // Filter out empty bill rows
      const validBills = formData.outstandingBills.filter(
        bill => bill.billNumber && bill.billDate && bill.billAmount > 0
      );
      
      // Format bill dates to ISO format
      const formattedBills = validBills.map(bill => ({
        ...bill,
        billAmount: parseFloat(bill.billAmount),
        billDate: new Date(bill.billDate).toISOString()
      }));
      
      onSubmit({
        ...formData,
        phone: formattedPhone,
        outstandingAmount: parseFloat(formData.outstandingAmount),
        outstandingBills: formattedBills
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
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number *
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
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Outstanding Bills
          </label>
          <button
            type="button"
            onClick={addBill}
            className="text-primary hover:text-primary-dark flex items-center text-sm"
          >
            <FiPlusCircle className="mr-1" /> Add Bill
          </button>
        </div>
        
        {formData.outstandingBills.map((bill, index) => (
          <div key={index} className="p-3 border border-gray-300 dark:border-gray-600 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bill #{index + 1}
              </span>
              
              {formData.outstandingBills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBill(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bill Number
                </label>
                <input
                  type="text"
                  value={bill.billNumber}
                  onChange={(e) => handleBillChange(index, 'billNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors[`bills.${index}.billNumber`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="INV-2023-001"
                />
                {errors[`bills.${index}.billNumber`] && <p className="text-red-500 text-xs mt-1">{errors[`bills.${index}.billNumber`]}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bill Date
                </label>
                <input
                  type="date"
                  value={bill.billDate}
                  onChange={(e) => handleBillChange(index, 'billDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors[`bills.${index}.billDate`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors[`bills.${index}.billDate`] && <p className="text-red-500 text-xs mt-1">{errors[`bills.${index}.billDate`]}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bill Amount (₹)
                </label>
                <input
                  type="number"
                  value={bill.billAmount}
                  onChange={(e) => handleBillChange(index, 'billAmount', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors[`bills.${index}.billAmount`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors[`bills.${index}.billAmount`] && <p className="text-red-500 text-xs mt-1">{errors[`bills.${index}.billAmount`]}</p>}
              </div>
            </div>
          </div>
        ))}
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
