import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST handler for file uploads
 * Saves files to the local filesystem in the public/uploads directory
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const fileName = formData.get('fileName');
    
    if (!file || !fileName) {
      return NextResponse.json(
        { error: 'File or filename is missing' },
        { status: 400 }
      );
    }

    // Convert the file to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create the upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    // Set the file path
    const filePath = path.join(uploadDir, fileName);
    
    // Write the file to the filesystem
    await writeFile(filePath, buffer);
    
    // Return the path where the file was saved
    return NextResponse.json({ 
      message: 'File uploaded successfully',
      filePath: `/uploads/${fileName}`
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
