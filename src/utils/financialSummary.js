// Utility functions to calculate financial summaries for the dashboard
import { connectToDatabase } from './db';
import Dealer from '../schema/dealer';

/**
 * Calculate financial summaries for a distributor
 * @param {string} distributorClerkId - The distributor's Clerk ID
 * @returns {Object} - Financial summary data including pending payments, successful payments, etc.
 */
export async function getFinancialSummary(distributorClerkId) {
  if (!distributorClerkId) {
    throw new Error('Distributor ID is required');
  }
  
  try {
    await connectToDatabase();
    
    // Get all dealers for this distributor
    const dealers = await Dealer.find({ distributorClerkRef: distributorClerkId });
    
    // Calculate total pending amount (sum of all dealer amounts)
    const totalPendingAmount = dealers.reduce((sum, dealer) => sum + (dealer.amount || 0), 0);
    
    // Count dealers with pending amounts
    const dealersWithPendingAmount = dealers.filter(dealer => dealer.amount > 0).length;
    
    // In a real app, you would track successful payments in a payments collection
    // For now, we'll return some placeholder data for successful payments
    const successfulPayments = 0; // In a real app, calculate this from a payments collection
    
    // Calculate the total messages sent (in a real app, you'd track this in a messages collection)
    const messagesSent = 0; // In a real app, calculate this from a messages collection
    
    // Get the date of the last reminder sent (in a real app, you'd track this in a messages collection)
    const lastReminderDate = new Date(); // Default to current date
    
    return {
      pendingAmount: totalPendingAmount,
      pendingInvoices: dealersWithPendingAmount,
      successfulPayments,
      messagesSent,
      lastReminderDate,
      totalDealers: dealers.length
    };
  } catch (error) {
    console.error('Error getting financial summary:', error);
    throw new Error(`Failed to get financial summary: ${error.message}`);
  }
}
