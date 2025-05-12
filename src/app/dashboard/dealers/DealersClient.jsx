'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiSearch, FiUpload } from 'react-icons/fi';
import DealerForm from './DealerForm';

export default function DealersClient() {
  const [dealers, setDealers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingDealer, setIsAddingDealer] = useState(false);
  const [editingDealerId, setEditingDealerId] = useState(null);
  
  // Mock data for demonstration purposes
  useEffect(() => {
    // In a real app, this would be fetched from an API
    const mockDealers = [
      { id: '1', name: 'Auto Parts Inc.', email: 'contact@autoparts.com', phone: '+1 (555) 123-4567', outstandingAmount: 12500 },
      { id: '2', name: 'Premium Motors', email: 'info@premiummotors.com', phone: '+1 (555) 987-6543', outstandingAmount: 8750 },
      { id: '3', name: 'City Dealership', email: 'sales@citydeal.com', phone: '+1 (555) 456-7890', outstandingAmount: 5300 },
    ];
    setDealers(mockDealers);
  }, []);

  const handleAddDealer = (newDealer) => {
    // In a real app, this would make an API call to add the dealer
    const dealerId = Date.now().toString(); // Simple ID generation for demo
    setDealers([...dealers, { id: dealerId, ...newDealer }]);
    setIsAddingDealer(false);
  };

  const handleUpdateDealer = (id, updatedData) => {
    // In a real app, this would make an API call to update the dealer
    setDealers(dealers.map(dealer => 
      dealer.id === id ? { ...dealer, ...updatedData } : dealer
    ));
    setEditingDealerId(null);
  };

  const handleDeleteDealer = (id) => {
    // In a real app, this would make an API call to delete the dealer
    if (window.confirm('Are you sure you want to delete this dealer?')) {
      setDealers(dealers.filter(dealer => dealer.id !== id));
    }
  };

  const handleImportDealers = (newDealers) => {
    // In a real app, this would validate and process the imported data
    const importedDealers = newDealers.map((dealer, index) => ({
      id: `import-${Date.now()}-${index}`,
      ...dealer
    }));
    setDealers([...dealers, ...importedDealers]);
  };

  const filteredDealers = dealers.filter(dealer => 
    dealer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dealer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
              <input
                type="file"
                id="dealerImport"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files.length) {
                    // For demo purposes, simulate import
                    const mockImportedDealers = [
                      { name: 'Excel Import Ltd.', email: 'info@excelimport.com', phone: '+1 (555) 111-2233', outstandingAmount: 7800 },
                      { name: 'Sheet Dealers Co.', email: 'contact@sheetdealers.com', phone: '+1 (555) 444-5566', outstandingAmount: 3200 },
                    ];
                    handleImportDealers(mockImportedDealers);
                  }
                }}
              />
              <button
                onClick={() => document.getElementById('dealerImport').click()}
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dealer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Outstanding Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDealers.length > 0 ? (
                filteredDealers.map((dealer) => (
                  <tr key={dealer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingDealerId === dealer.id ? (
                        <input
                          type="text"
                          className="w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:text-white"
                          defaultValue={dealer.name}
                          id={`name-${dealer.id}`}
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{dealer.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingDealerId === dealer.id ? (
                        <div className="space-y-2">
                          <input
                            type="email"
                            className="w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:text-white"
                            defaultValue={dealer.email}
                            id={`email-${dealer.id}`}
                            placeholder="Email"
                          />
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:text-white"
                            defaultValue={dealer.phone}
                            id={`phone-${dealer.id}`}
                            placeholder="Phone"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{dealer.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{dealer.phone}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingDealerId === dealer.id ? (
                        <input
                          type="number"
                          className="w-full px-2 py-1 border rounded-md dark:bg-gray-700 dark:text-white"
                          defaultValue={dealer.outstandingAmount}
                          id={`amount-${dealer.id}`}
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ₹{dealer.outstandingAmount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingDealerId === dealer.id ? (
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => {
                              const name = document.getElementById(`name-${dealer.id}`).value;
                              const email = document.getElementById(`email-${dealer.id}`).value;
                              const phone = document.getElementById(`phone-${dealer.id}`).value;
                              const outstandingAmount = parseFloat(document.getElementById(`amount-${dealer.id}`).value);
                              
                              handleUpdateDealer(dealer.id, {
                                name, email, phone, outstandingAmount
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
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => setEditingDealerId(dealer.id)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDealer(dealer.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 cursor-pointer"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No dealers found. Add a dealer or import from Excel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredDealers.length > 0 && (
          <div className="py-3 px-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div>
              Showing {filteredDealers.length} of {dealers.length} dealers
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
