"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * WhatsApp Message Form Component
 * Allows sending WhatsApp messages using Twilio
 */
export default function WhatsAppMessageForm({ dealerId, dealerPhone, dealerName, initialAmount = '' }) {
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(initialAmount || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Send WhatsApp message via Twilio
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealerId,
          phone: dealerPhone,
          message: message || `Hey ${dealerName}, you have an outstanding amount of ₹${amount}. Kindly please pay it back as soon as possible. Thanks.`,
          amount: parseFloat(amount) || 0,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error sending message');
      }
      
      setSuccess(`Message sent successfully to ${dealerName}`);
      setMessage('');
      
      // Refresh the page after successful message
      setTimeout(() => {
        router.refresh();
      }, 2000);

    } catch (err) {
      console.error('Error sending WhatsApp message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-5 w-full max-w-md mx-auto">
      <h3 className="text-lg font-medium mb-4">Send WhatsApp Message via Twilio</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Outstanding Amount (₹)
          </label>
          <input
            type="number"
            id="amount"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Message (Optional)
          </label>
          <textarea
            id="message"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={`Default: Hey ${dealerName}, you have an outstanding amount of ₹${amount || '[amount]'}. Kindly please pay it back as soon as possible. Thanks.`}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded text-white ${
            isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {isLoading ? 'Sending...' : 'Send WhatsApp Message'}
        </button>
      </form>
    </div>
  );
}
