// Helper middleware for handling multipart form data in Next.js API routes
import { NextResponse } from 'next/server';

/**
 * Processes a multipart form data request, allowing access to file data
 * @param {Request} request - The incoming request
 * @returns {Promise<FormData>} - A promise that resolves to the parsed FormData
 */
export async function processFormData(request) {
  try {
    return await request.formData();
  } catch (error) {
    console.error('Error processing form data:', error);
    throw new Error('Failed to process form data');
  }
}

/**
 * Extracts a file from form data and returns its buffer
 * @param {FormData} formData - The parsed form data
 * @param {string} fieldName - The name of the file field in the form
 * @returns {Promise<Buffer>} - A promise that resolves to the file buffer
 */
export async function getFileBuffer(formData, fieldName = 'file') {
  const file = formData.get(fieldName);
  
  if (!file) {
    throw new Error('No file found in form data');
  }
  
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * Returns a standardized error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {NextResponse} - Error response object
 */
export function errorResponse(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Returns a standardized success response
 * @param {object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {NextResponse} - Success response object
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}
