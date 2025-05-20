'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiSend, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import MessageHistory from './MessageHistory';

export default function MessageClient() {
  const [dealers, setDealers] = useState([]);
  const [selectedDealers, setSelectedDealers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [provider, setProvider] = useState('twilio'); // Default to Twilio
  
  // Fetch dealers from the API
  const fetchDealers = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch from actual API
      const response = await fetch('/api/dealers');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the dealers data
      const formattedDealers = data.dealers.map(dealer => ({
        id: dealer._id,
        name: dealer.companyName,
        phone: dealer.phoneNumber,
        amount: dealer.amount || 0
      }));
      
      setDealers(formattedDealers);
      
      // By default, select all dealers with outstanding amounts
      const dealersWithAmount = formattedDealers
        .filter(dealer => dealer.amount > 0)
        .map(dealer => dealer.id);
      
      setSelectedDealers(dealersWithAmount);
    } catch (error) {
      console.error('Failed to fetch dealers:', error);
      setError('Failed to load dealers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDealers();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select only dealers with outstanding amounts
      const dealersWithAmount = dealers
        .filter(dealer => dealer.amount > 0)
        .map(dealer => dealer.id);
      
      setSelectedDealers(dealersWithAmount);
    } else {
      setSelectedDealers([]);
    }
  };

  const handleSelectDealer = (dealerId) => {
    if (selectedDealers.includes(dealerId)) {
      setSelectedDealers(selectedDealers.filter(id => id !== dealerId));
    } else {
      setSelectedDealers([...selectedDealers, dealerId]);
    }
  };
  
  const handleSendMessages = async () => {
    if (selectedDealers.length === 0) {
      setError('Please select at least one dealer to send messages.');
      return;
    }
    
    try {
      setError('');
      setIsSending(true);
      
      // Send request to API
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealerIds: selectedDealers,
          customMessage: showCustomMessage ? customMessage : undefined,
          provider: provider // Add the provider to the payload
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send messages');
      }
      
      const result = await response.json();
      
      // Show success message
      setSuccess({
        totalSent: result.totalSent,
        totalFailed: result.totalFailed,
        timestamp: new Date()
      });
      
      // Clear selections after successful send
      setSelectedDealers([]);
    } catch (error) {
      console.error('Error sending messages:', error);
      setError(error.message || 'Failed to send messages. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Filter dealers to only show those with outstanding amounts
  const dealersWithOutstanding = dealers.filter(dealer => dealer.amount > 0);
  
  return (
    <div>
      {/* Error notification */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-200 dark:hover:bg-red-800/50 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success notification */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiCheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {success.totalSent} messages sent successfully! 
                {success.totalFailed > 0 && ` (${success.totalFailed} failed)`}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setSuccess(null)}
                  className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-200 dark:hover:bg-green-800/50 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Send WhatsApp Payment Reminders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select dealers with outstanding payments to send WhatsApp reminders.
          </p>
        </div>

        {/* Message stats at the top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 p-4 rounded-lg shadow-sm backdrop-blur-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Dealers with Outstanding Amount</h3>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {dealersWithOutstanding.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total dealers with pending payments
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 p-4 rounded-lg shadow-sm backdrop-blur-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Total Outstanding Amount</h3>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ₹{dealersWithOutstanding.reduce((sum, dealer) => sum + dealer.amount, 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Combined pending payments
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 p-4 rounded-lg shadow-sm backdrop-blur-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Selected Dealers</h3>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {selectedDealers.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dealers selected for sending messages
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : dealersWithOutstanding.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No dealers with outstanding payments found.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedDealers.length === dealersWithOutstanding.length && dealersWithOutstanding.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
              />
              <label htmlFor="select-all" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select All Dealers ({dealersWithOutstanding.length})
              </label>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="custom-message"
                  checked={showCustomMessage}
                  onChange={(e) => setShowCustomMessage(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                />
                <label htmlFor="custom-message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Use Custom Message
                </label>
              </div>
              
              {showCustomMessage && (
                <div className="mt-2">
                  <label htmlFor="message-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Message
                  </label>
                  <textarea
                    id="message-text"
                    rows="4"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter your custom message here. Use {dealerName} and {amount} as placeholders for personalization."
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-gray-300 dark:border-gray-600"
                  ></textarea>
                  
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message Preview</h4>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800/30 relative">
                      <div className="absolute top-0 left-0 w-2 h-full bg-green-500 rounded-l-lg"></div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 pl-2">
                        {customMessage || "Hey [Dealer Name], you have an outstanding amount of ₹[Amount]. Kindly please pay it back as soon as possible. Thanks."}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <strong>Default message:</strong> "Hey [Dealer Name], you have an outstanding amount of ₹[Amount]. Kindly please pay it back as soon as possible. Thanks."
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select WhatsApp Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    provider === 'twilio' 
                      ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                  onClick={() => setProvider('twilio')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 border ${
                      provider === 'twilio' ? 'border-primary bg-primary' : 'border-gray-400'
                    }`}>
                      {provider === 'twilio' && (
                        <FiCheck className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">Twilio WhatsApp</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                    Using Twilio WhatsApp Business API Integration
                  </p>
                </div>
                
                <div 
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    provider === 'meta' 
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-600/50'
                  }`}
                  onClick={() => setProvider('meta')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 border ${
                      provider === 'meta' ? 'border-green-600 bg-green-600' : 'border-gray-400'
                    }`}>
                      {provider === 'meta' && (
                        <FiCheck className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">Meta WhatsApp</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                    Using Meta WhatsApp Business Platform (Direct Integration)
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dealer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Outstanding Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {dealersWithOutstanding.map(dealer => (
                    <tr key={dealer.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedDealers.includes(dealer.id)}
                          onChange={() => handleSelectDealer(dealer.id)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {dealer.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {dealer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ₹{dealer.amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-center mt-6">
              <button
                onClick={handleSendMessages}
                disabled={isSending || selectedDealers.length === 0}
                className={`px-6 py-3 flex items-center justify-center mx-auto text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors ${
                  (isSending || selectedDealers.length === 0) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSending ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Send WhatsApp Messages to {selectedDealers.length} Dealers
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Messages will be sent using WhatsApp Business {provider === 'meta' ? 'Platform via Meta' : 'API via Twilio'}
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Message History Section */}
      <MessageHistory />
    </div>
  );
}
