"use client";

import { useState, useEffect } from 'react';
import WhatsAppMessageForm from '../../../components/WhatsAppMessageForm';

export default function WhatsAppPage() {
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDealers() {
      try {
        const response = await fetch('/api/dealers');
        if (!response.ok) {
          throw new Error('Failed to fetch dealers');
        }
        const data = await response.json();
        setDealers(data.dealers || []);
      } catch (err) {
        console.error('Error fetching dealers:', err);
        setError(err.message || 'Failed to load dealers');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDealers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">WhatsApp Messaging Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">Select Dealer</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : dealers.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              No dealers found. Add dealers first to send WhatsApp messages.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {dealers.map((dealer) => (
                <div 
                  key={dealer._id}
                  onClick={() => setSelectedDealer(dealer)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedDealer?._id === dealer._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <h3 className="font-medium">{dealer.name}</h3>
                  <p className="text-sm text-gray-600">{dealer.phone}</p>
                  {dealer.outstandingAmount > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      Outstanding: ₹{dealer.outstandingAmount.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          {selectedDealer ? (
            <WhatsAppMessageForm 
              dealerId={selectedDealer._id}
              dealerPhone={selectedDealer.phone}
              dealerName={selectedDealer.name}
              initialAmount={selectedDealer.outstandingAmount?.toString() || ''}
            />
          ) : (
            <div className="bg-gray-50 shadow-md rounded-lg p-5 flex items-center justify-center h-64">
              <p className="text-gray-500">Select a dealer to send a WhatsApp message</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white shadow-md rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-4">Twilio WhatsApp Setup Guide</h2>
        <div className="prose max-w-none">
          <p>Follow these steps to ensure your Twilio WhatsApp integration is working correctly:</p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Make sure your <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>, and <code>TWILIO_WHATSAPP_NUMBER</code> environment variables are set correctly.</li>
            <li>Ensure your Twilio number is enabled for WhatsApp messaging in the Twilio console.</li>
            <li>For testing, add recipient numbers to your Twilio Sandbox for WhatsApp.</li>
            <li>For production, apply for WhatsApp Business API through Twilio.</li>
            <li>Test your setup using the dashboard above.</li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> All WhatsApp messages are sent using the Twilio API. Make sure your Twilio account has sufficient credits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
