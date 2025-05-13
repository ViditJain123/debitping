import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../../utils/db';

/**
 * GET handler to check database connection and get client IP
 */
export async function GET(request) {
  // Get the client IP address from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  const clientIp = forwardedFor ? forwardedFor.split(',')[0] : realIp || 'Unknown';
  
  try {
    // Try to connect to the database
    await connectToDatabase();
    
    // Get connection status
    const status = mongoose.connection.readyState;
    
    // Map status code to a readable status
    const statusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return NextResponse.json({
      status: 'success',
      database: {
        status: statusMap[status] || 'unknown',
        host: mongoose.connection.host,
      },
      client: {
        ip: clientIp,
        headers: {
          'x-forwarded-for': forwardedFor || 'Not provided',
          'x-real-ip': realIp || 'Not provided'
        },
      },
      message: 'Add this IP address to your MongoDB Atlas IP whitelist: ' + clientIp
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      client: {
        ip: clientIp,
        headers: {
          'x-forwarded-for': forwardedFor || 'Not provided',
          'x-real-ip': realIp || 'Not provided'
        },
      },
      error: error.message,
      message: 'Failed to connect to MongoDB. Add this IP address to your MongoDB Atlas IP whitelist: ' + clientIp
    }, { status: 500 });
  }
}