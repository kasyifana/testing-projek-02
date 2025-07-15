import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Validate file size (10MB for images/pdf, 2MB for videos)
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 2 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum ${isVideo ? '2MB for videos' : '10MB for other files'}` 
      }, { status: 400 });
    }
    
    // Generate unique filename using timestamp
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const timestamp = Date.now();
    const filename = `lampiran_${timestamp}.${fileExtension}`;
    
    console.log('Generated filename:', filename);
    console.log('Original filename:', file.name);
    console.log('Timestamp used:', timestamp);
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Define the upload path
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    // Write file to public/uploads
    await writeFile(uploadPath, buffer);
    
    // Return file information
    return NextResponse.json({
      success: true,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: `/uploads/${filename}`, // Relative URL for accessing the file
      localPath: uploadPath // Full local path for reference
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
