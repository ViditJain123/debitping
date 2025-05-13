import mongoose from 'mongoose';

// Connection cache for serverless env
let cachedConnection = null;

/**
 * Connect to MongoDB using Mongoose
 */
export async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedConnection) {
    return cachedConnection;
  }

  // Check if we have the MongoDB URI in environment variables
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    // Connect to MongoDB with improved options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds instead of default 30
      socketTimeoutMS: 30000, // Close sockets after 30 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });
    
    console.log('MongoDB connected successfully');
    
    // Cache the connection
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectFromDatabase() {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    console.log('Disconnected from MongoDB');
  }
}