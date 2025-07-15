# Fix Filename Consistency - Frontend Implementation

## Problem
Backend Laravel user mengharapkan field `filename` untuk menggunakan nama file yang sama, tetapi frontend tidak mengirim field tersebut. Ini menyebabkan backend membuat timestamp baru.

## Solution
Modifikasi frontend untuk mengirim field `filename` yang sesuai dengan ekspektasi backend Laravel.

## Changes Made

### 1. Modified `src/app/user/create-report/page.jsx`

**Before:**
```javascript
submissionData.append('lampiran_filename', fileName); // Use the EXACT filename from upload
```

**After:**
```javascript
// CRITICAL: Backend Laravel expects 'filename' field to use existing filename
submissionData.append('filename', fileName); // Use the EXACT filename from upload
submissionData.append('lampiran_filename', fileName); // Keep this for backward compatibility
```

## Backend Laravel Code (User's Existing)
```php
$lampiranPath = null;
if ($request->hasFile('lampiran')) {
    $file = $request->file('lampiran');
    $fileName = $file->getClientOriginalName();
    
    // If we're getting a filename from the request directly, use that exact name
    if ($request->has('filename') && !empty($request->filename)) {
        $fileName = $request->filename; // ← This is what we're targeting
    }
    // Otherwise, keep the original name if it follows our pattern
    else if (!preg_match('/^lampiran_\d+\.\w+$/', $fileName)) {
        // If not in expected format, generate one with current timestamp
        $fileName = 'lampiran_' . time() . '.' . $file->getClientOriginalExtension();
    }
    
    // Make sure the uploads directory exists
    if (!file_exists(public_path('uploads'))) {
        mkdir(public_path('uploads'), 0777, true);
    }
    
    $file->move(public_path('uploads'), $fileName);
    $lampiranPath = 'public/uploads/' . $fileName;
}
```

## How It Works

1. **Frontend Upload**: File diupload ke `/api/upload-file` dengan timestamp `Date.now()`
   ```javascript
   const timestamp = Date.now();
   const filename = `lampiran_${timestamp}.${fileExtension}`;
   ```

2. **Frontend Submit**: Form mengirim field `filename` ke backend Laravel
   ```javascript
   submissionData.append('filename', fileName); // Menggunakan nama file yang sama
   ```

3. **Backend Laravel**: Menggunakan field `filename` yang dikirim frontend
   ```php
   if ($request->has('filename') && !empty($request->filename)) {
       $fileName = $request->filename; // ✅ Menggunakan filename dari frontend
   }
   ```

## Expected Result

**Before Fix:**
- Frontend generates: `lampiran_1752568897798.jpg`
- Backend uses: `lampiran_1752568902.jpg` ❌

**After Fix:**
- Frontend generates: `lampiran_1752568897798.jpg`
- Backend uses: `lampiran_1752568897798.jpg` ✅

## Fields Sent to Backend

```javascript
// Required fields for backend
submissionData.append('filename', fileName);           // ← NEW: Main field backend expects
submissionData.append('lampiran_filename', fileName);  // ← Backup for compatibility
submissionData.append('lampiran_original_name', formData.originalFileName);
submissionData.append('lampiran_type', formData.fileType);
submissionData.append('lampiran_size', formData.lampiran.size.toString());
```

## Testing

1. Upload file di frontend
2. Check console log untuk filename yang digenerate
3. Submit form
4. Verify backend menggunakan filename yang sama

## Notes

- Tidak perlu mengubah backend Laravel user
- Hanya perlu menambahkan field `filename` di frontend
- Field `lampiran_filename` tetap dikirim untuk kompatibilitas
- Backend akan otomatis menggunakan field `filename` sesuai kode yang sudah ada
