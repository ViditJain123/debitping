'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiSearch, FiUpload, FiMessageSquare } from 'react-icons/fi';
import DealerForm from './DealerForm';
import DealersFileUploader from './DealersFileUploader';

// Helper function for phone number formatting
function formatE164PhoneNumber(phoneNumber) {
  // Remove all non-digit characters except the + sign
  const stripped = phoneNumber.replace(/[^\d+]/g, '');
  
  // Ensure it starts with a + sign
  if (!stripped.startsWith('+')) {
    return '+' + stripped;
  }
  
  return stripped;
}

export default function DealersClient() {
  const [dealers, setDealers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingDealer, setIsAddingDealer] = useState(false);
  const [editingDealerId, setEditingDealerId] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState('');
  
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
      
      // Transform the data to match our UI format
      const formattedDealers = data.dealers.map(dealer => ({
        id: dealer._id,
        name: dealer.companyName,
        phone: dealer.phoneNumber,
        outstandingAmount: dealer.amount || 0
      }));
      
      setDealers(formattedDealers);
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

  const handleAddDealer = async (newDealer) => {
    try {
      setError('');
      // Format the data to match the API expectations
      const dealerData = {
        companyName: newDealer.name,
        phoneNumber: newDealer.phone,
        amount: newDealer.outstandingAmount
      };
      
      // Send request to create dealer
      const response = await fetch('/api/dealers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealerData),
      });

      if (!response.ok) {
        throw new Error('Failed to add dealer');
      }

      const data = await response.json();
      
      // Add the new dealer to state
      setDealers([...dealers, { 
        id: data.dealer._id,
        name: data.dealer.companyName,
        phone: data.dealer.phoneNumber,
        outstandingAmount: data.dealer.amount
      }]);
      
      setIsAddingDealer(false);
    } catch (error) {
      console.error('Error adding dealer:', error);
      setError('Failed to add dealer. Please try again.');
    }
  };

  const handleUpdateDealer = async (id, updatedData) => {
    try {
      setError('');
      // Format the data to match the API expectations
      const dealerData = {
        dealerId: id
      };
      
      // Only include the fields that are being updated
      if (updatedData.name) dealerData.companyName = updatedData.name;
      if (updatedData.phone) dealerData.phoneNumber = updatedData.phone;
      if (updatedData.outstandingAmount !== undefined) dealerData.amount = updatedData.outstandingAmount;
      
      // Send request to update dealer
      const response = await fetch('/api/dealers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealerData),
      });

      if (!response.ok) {
        throw new Error('Failed to update dealer');
      }

      // Update state with updated dealer
      setDealers(dealers.map(dealer => 
        dealer.id === id ? { 
          ...dealer, 
          name: updatedData.name || dealer.name,
          phone: updatedData.phone || dealer.phone,
          outstandingAmount: updatedData.outstandingAmount !== undefined ? updatedData.outstandingAmount : dealer.outstandingAmount
        } : dealer
      ));
      
      setEditingDealerId(null);
    } catch (error) {
      console.error('Error updating dealer:', error);
      setError('Failed to update dealer. Please try again.');
      setEditingDealerId(null);
    }
  };

  const handleDeleteDealer = async (id) => {
    if (window.confirm('Are you sure you want to delete this dealer?')) {
      try {
        setError('');
        // Send request to delete dealer
        const response = await fetch(`/api/dealers`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dealerId: id }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete dealer');
        }

        // Remove dealer from state
        setDealers(dealers.filter(dealer => dealer.id !== id));
      } catch (error) {
        console.error('Error deleting dealer:', error);
        setError('Failed to delete dealer. Please try again.');
      }
    }
  };
  
  const handleSendMessage = (dealer) => {
    setSelectedDealer(dealer);
    setMessageDialogOpen(true);
  };

  const handleImportDealers = (importResult) => {
    if (!importResult || !importResult.dealers || importResult.dealers.length === 0) {
      return;
    }
    
    // The import was already processed on the server
    // Just need to refresh our dealers list
    fetchDealers();
    
    // Show success notification
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
    }, 5000);
  };

  // Sort dealers by recently imported first if import just happened
  const sortedDealers = [...dealers].sort((a, b) => {
    if (importSuccess) {
      // If we just imported, prioritize new dealers
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
    }
    // Otherwise sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
  
  // Filter dealers based on search query
  const filteredDealers = sortedDealers.filter(dealer => 
    dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.phone.includes(searchQuery)
  );

  return (
    <div>
      {/* Modal for adding dealer */}
      {isAddingDealer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Dealer</h2>
            <DealerForm 
              onSubmit={handleAddDealer}
              onCancel={() => setIsAddingDealer(false)}
            />
          </div>
        </div>
      )}

      {/* Modal for sending message to dealer */}
      {messageDialogOpen && selectedDealer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Send Message to {selectedDealer.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Send a WhatsApp message to {selectedDealer.phone}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border-gray-300 dark:border-gray-600"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMessageDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <FiX className="inline-block mr-1 -mt-0.5" />
                Cancel
              </button>
              <button
                onClick={() => {
                  // Send message logic would go here
                  alert(`Message sent to ${selectedDealer.name} at ${selectedDealer.phone}`);
                  setMessageDialogOpen(false);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <FiMessageSquare className="inline-block mr-1 -mt-0.5" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5 text-red-500" />
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

      {/* Dealers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h2 className="text-xl font-semibold">Dealers List</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search dealers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsImportDialogOpen(true)}
                className="px-3 py-2 flex items-center text-sm font-medium text-white bg-secondary hover:bg-secondary-dark rounded-md transition-colors border border-secondary hover:border-secondary-dark shadow-sm hover:shadow cursor-pointer"
              >
                <FiUpload className="mr-1" />
                Import
              </button>
              <button
                onClick={() => setIsAddingDealer(true)}
                className="px-3 py-2 flex items-center text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors border border-primary hover:border-primary-dark shadow-sm hover:shadow cursor-pointer"
              >
                <FiPlus className="mr-1" />
                Add Dealer
              </button>
            </div>
          </div>
        </div>

        {/* Success notification */}
        {importSuccess && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCheck className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Dealers imported successfully! Your dealers list has been updated.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setImportSuccess(false)}
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

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dealer Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Outstanding Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDealers.length > 0 ? (
                  filteredDealers.map((dealer) => (
                    <tr key={dealer.id} className={dealer.isNew ? "bg-green-50 dark:bg-green-900/10" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {editingDealerId === dealer.id ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:text-white text-center"
                            defaultValue={dealer.name}
                            id={`name-${dealer.id}`}
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{dealer.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {editingDealerId === dealer.id ? (
                          <div>
                            <input
                              type="text"
                              className="w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:text-white text-center"
                              defaultValue={dealer.phone}
                              id={`phone-${dealer.id}`}
                              placeholder="Phone"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{dealer.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {editingDealerId === dealer.id ? (
                          <input
                            type="number"
                            className="w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:text-white text-center"
                            defaultValue={dealer.outstandingAmount}
                            id={`amount-${dealer.id}`}
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            ₹{dealer.outstandingAmount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {editingDealerId === dealer.id ? (
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => {
                                const name = document.getElementById(`name-${dealer.id}`).value;
                                const phone = document.getElementById(`phone-${dealer.id}`).value;
                                const formattedPhone = formatE164PhoneNumber(phone);
                                const outstandingAmount = parseFloat(document.getElementById(`amount-${dealer.id}`).value);
                                
                                handleUpdateDealer(dealer.id, {
                                  name, phone: formattedPhone, outstandingAmount
                                });
                              }}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 cursor-pointer"
                            >
                              <FiCheck className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => setEditingDealerId(null)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => setEditingDealerId(dealer.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer"
                              title="Edit dealer"
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDealer(dealer.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer"
                              title="Delete dealer"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleSendMessage(dealer)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 cursor-pointer"
                              title="Send message"
                            >
                              <FiMessageSquare className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {searchQuery ? 'No dealers found matching your search.' : 'No dealers found. Add a dealer or import from Excel.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {filteredDealers.length > 0 && (
          <div className="py-3 px-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div>
              Showing {filteredDealers.length} of {dealers.length} dealers
            </div>
          </div>
        )}
      </div>

      {/* Excel Import Dialog */}
      {isImportDialogOpen && (
        <DealersFileUploader 
          onImport={(importResult) => {
            handleImportDealers(importResult);
            // Don't auto-close so user can see the import results
          }}
          onClose={() => {
            // Refresh dealers list when dialog is closed after import
            fetchDealers();
            setIsImportDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
