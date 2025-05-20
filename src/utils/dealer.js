import { connectToDatabase } from './db';
import Dealer from '../schema/dealer';
import User from '../schema/user';

/**
 * Create a new dealer and associate it with a distributor (user)
 * @param {Object} dealerData - Dealer data with companyName, phoneNumber, amount
 * @param {string} distributorClerkId - The distributor's Clerk ID
 * @returns {Object} - The created dealer
 */
export async function createDealer(dealerData, distributorClerkId) {
  if (!dealerData || !distributorClerkId) {
    throw new Error('Dealer data and distributor ID are required');
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Create the new dealer
    const newDealer = new Dealer({
      companyName: dealerData.companyName,
      phoneNumber: dealerData.phoneNumber,
      amount: dealerData.amount || 0,
      distributorClerkRef: distributorClerkId,
      outstandingBills: dealerData.outstandingBills || []
    });

    // Save the dealer
    const savedDealer = await newDealer.save();
    
    // Add this dealer to the distributor's dealers array
    await User.findOneAndUpdate(
      { clerkId: distributorClerkId },
      { $push: { dealers: savedDealer._id } }
    );

    console.log(`New dealer created successfully: ${savedDealer.companyName}`);
    return savedDealer;
  } catch (error) {
    console.error('Error creating dealer:', error.message);
    console.error(error.stack);
    throw new Error(`Failed to create dealer: ${error.message}`);
  }
}

/**
 * Get all dealers associated with a distributor
 * @param {string} distributorClerkId - The distributor's Clerk ID
 * @returns {Array} - Array of dealers
 */
export async function getDealersByDistributor(distributorClerkId) {
  if (!distributorClerkId) {
    throw new Error('Distributor ID is required');
  }
  
  try {
    await connectToDatabase();
    return await Dealer.find({ distributorClerkRef: distributorClerkId });
  } catch (error) {
    console.error('Error getting dealers:', error);
    throw new Error(`Failed to get dealers: ${error.message}`);
  }
}

/**
 * Get a dealer by ID, verifying it belongs to the specified distributor
 * @param {string} dealerId - The dealer's MongoDB ID
 * @param {string} distributorClerkId - The distributor's Clerk ID (for verification)
 * @returns {Object|null} - The dealer object or null if not found
 */
export async function getDealerById(dealerId, distributorClerkId) {
  if (!dealerId || !distributorClerkId) {
    throw new Error('Dealer ID and distributor ID are required');
  }
  
  try {
    await connectToDatabase();
    
    // Find the dealer and verify it belongs to this distributor
    return await Dealer.findOne({
      _id: dealerId,
      distributorClerkRef: distributorClerkId
    });
  } catch (error) {
    console.error('Error getting dealer by ID:', error);
    throw new Error(`Failed to get dealer: ${error.message}`);
  }
}

/**
 * Update a dealer
 * @param {string} dealerId - The dealer's MongoDB ID
 * @param {Object} updateData - Data to update
 * @param {string} distributorClerkId - The distributor's Clerk ID (for verification)
 * @returns {Object} - The updated dealer
 */
export async function updateDealer(dealerId, updateData, distributorClerkId) {
  if (!dealerId || !updateData || !distributorClerkId) {
    throw new Error('Dealer ID, update data, and distributor ID are required');
  }
  
  try {
    await connectToDatabase();
    
    // Verify that this dealer belongs to this distributor
    const dealer = await Dealer.findOne({
      _id: dealerId,
      distributorClerkRef: distributorClerkId
    });
    
    if (!dealer) {
      throw new Error('Dealer not found or does not belong to this distributor');
    }
    
    // Update the dealer
    Object.keys(updateData).forEach(key => {
      dealer[key] = updateData[key];
    });
    
    await dealer.save();
    return dealer;
  } catch (error) {
    console.error('Error updating dealer:', error);
    throw new Error(`Failed to update dealer: ${error.message}`);
  }
}

/**
 * Delete a dealer
 * @param {string} dealerId - The dealer's MongoDB ID
 * @param {string} distributorClerkId - The distributor's Clerk ID (for verification)
 * @returns {boolean} - True if successful
 */
export async function deleteDealer(dealerId, distributorClerkId) {
  if (!dealerId || !distributorClerkId) {
    throw new Error('Dealer ID and distributor ID are required');
  }
  
  try {
    await connectToDatabase();
    
    // Verify that this dealer belongs to this distributor
    const dealer = await Dealer.findOne({
      _id: dealerId,
      distributorClerkRef: distributorClerkId
    });
    
    if (!dealer) {
      throw new Error('Dealer not found or does not belong to this distributor');
    }
    
    // Remove the dealer
    await Dealer.deleteOne({ _id: dealerId });
    
    // Remove the dealer reference from the distributor's dealers array
    await User.findOneAndUpdate(
      { clerkId: distributorClerkId },
      { $pull: { dealers: dealerId } }
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting dealer:', error);
    throw new Error(`Failed to delete dealer: ${error.message}`);
  }
}

/**
 * Update the last message received from a dealer
 * @param {string} dealerId - The dealer's MongoDB ID
 * @param {string} message - The message text
 * @returns {Object} - The updated dealer
 */
export async function updateDealerLastMessage(dealerId, message) {
  if (!dealerId || !message) {
    throw new Error('Dealer ID and message are required');
  }
  
  try {
    await connectToDatabase();
    
    const dealer = await Dealer.findById(dealerId);
    
    if (!dealer) {
      throw new Error('Dealer not found');
    }
    
    dealer.lastMessageReceived = message;
    dealer.lastMessageReceivedAt = new Date();
    
    await dealer.save();
    return dealer;
  } catch (error) {
    console.error('Error updating dealer last message:', error);
    throw new Error(`Failed to update dealer last message: ${error.message}`);
  }
}

/**
 * Update the last message sent by a distributor
 * @param {string} distributorClerkId - The distributor's Clerk ID
 * @param {string} message - The message text
 * @returns {Object} - The updated distributor
 */
export async function updateDistributorLastMessage(distributorClerkId, message) {
  if (!distributorClerkId || !message) {
    throw new Error('Distributor ID and message are required');
  }
  
  try {
    await connectToDatabase();
    
    const distributor = await User.findOne({ clerkId: distributorClerkId });
    
    if (!distributor) {
      throw new Error('Distributor not found');
    }
    
    distributor.lastMessageSent = message;
    distributor.lastMessageSentAt = new Date();
    
    await distributor.save();
    return distributor;
  } catch (error) {
    console.error('Error updating distributor last message:', error);
    throw new Error(`Failed to update distributor last message: ${error.message}`);
  }
}
