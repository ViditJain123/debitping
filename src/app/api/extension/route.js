import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Package the extension if it hasn't been packaged yet
    const zipPath = path.join(process.cwd(), 'public', 'downloads', 'tally-cors-bridge.zip');
    
    // Check if the zip file exists
    if (!fs.existsSync(zipPath)) {
      // Redirect to the script that creates the zip
      // This approach won't work in production, you'll want to pre-build the zip
      return NextResponse.redirect(new URL('/api/extension/create-zip', request.url));
    }
    
    // Return a JSON response with the download URL
    return NextResponse.json({ 
      downloadUrl: '/downloads/tally-cors-bridge.zip',
      message: 'Extension package available for download' 
    });
  } catch (error) {
    console.error('Error in extension API:', error);
    return NextResponse.json(
      { error: 'Failed to get extension download link' },
      { status: 500 }
    );
  }
}
