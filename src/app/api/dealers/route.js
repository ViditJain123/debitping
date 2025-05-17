import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { 
  createDealer,
  getDealersByDistributor,
  updateDealer,
  deleteDealer,
  updateDealerLastMessage
} from '../../../utils/dealer';

export async function GET(request) {
  try {
    // Get the user's Clerk ID from the auth session
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all dealers for this distributor
    const dealers = await getDealersByDistributor(userId);
    
    return NextResponse.json({ dealers });
  } catch (error) {
    console.error('Error in GET /api/dealers:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Get the user's Clerk ID from the auth session
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get dealer data from request body
    const dealerData = await request.json();
    
    if (!dealerData.companyName || !dealerData.phoneNumber) {
      return NextResponse.json(
        { error: 'Company name and phone number are required' },
        { status: 400 }
      );
    }
    
    // Create the dealer
    const dealer = await createDealer(dealerData, userId);
    
    return NextResponse.json({ dealer }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/dealers:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Get the user's Clerk ID from the auth session
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get dealer data and ID from request body
    const { dealerId, ...updateData } = await request.json();
    
    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }
    
    // Update the dealer
    const dealer = await updateDealer(dealerId, updateData, userId);
    
    return NextResponse.json({ dealer });
  } catch (error) {
    console.error('Error in PUT /api/dealers:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Get the user's Clerk ID from the auth session
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get dealer ID from URL
    const url = new URL(request.url);
    const dealerId = url.searchParams.get('dealerId');
    
    if (!dealerId) {
      return NextResponse.json(
        { error: 'Dealer ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the dealer
    await deleteDealer(dealerId, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/dealers:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
