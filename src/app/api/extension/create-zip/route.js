import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(request) {
  try {
    // Run the package-extension script
    const scriptPath = path.join(process.cwd(), 'scripts', 'createExtensionZip.js');
    
    await execPromise(`node ${scriptPath}`);
    
    // Redirect to the extension download API
    return NextResponse.redirect(new URL('/api/extension', request.url));
  } catch (error) {
    console.error('Error creating extension ZIP:', error);
    return NextResponse.json(
      { error: 'Failed to create extension package' },
      { status: 500 }
    );
  }
}
