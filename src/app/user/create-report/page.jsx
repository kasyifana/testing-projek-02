'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Upload, CheckCircle } from 'lucide-react';

const categories = [
	{ value: 'fasilitas', label: 'Fasilitas' },
	{ value: 'kekerasan', label: 'Kekerasan' },
	{ value: 'akademik', label: 'Akademik' },
	{ value: 'lainnya', label: 'Lainnya' }
];

const priorities = [
	{ value: 'High', label: 'Mendesak' },
	{ value: 'Medium', label: 'Normal' },
	{ value: 'Low', label: 'Rendah' }
];

export default function CreateReport() {
	const [formData, setFormData] = useState({
		judul: '',
		kategori: '',
		deskripsi: '',
		prioritas: '',
		lampiran: null,
		generatedFileName: null, // To store the client-generated filename
		originalFileName: null,  // To store the original filename
		fileType: null,  // To store the file MIME type
		fileExtension: null  // To store the file extension
	});
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userId, setUserId] = useState(null); // Add state for user ID
	const [userFullName, setUserFullName] = useState(''); // Add state for user's full name from profile
	
	// Fetch user profile to get user_id and name when component mounts
	useEffect(() => {
		// Check for stored user name in localStorage first (for quick display)
		const storedName = localStorage.getItem('user_name');
		const storedUserId = localStorage.getItem('user_id');
		
		if (storedName) {
			console.log('Found stored user name in localStorage:', storedName);
			setUserFullName(storedName);
		}
		
		if (storedUserId) {
			console.log('Found stored user ID in localStorage:', storedUserId);
			setUserId(storedUserId);
		}
		
		const fetchUserProfile = async () => {
			try {
				// Get token from local storage
				const token = localStorage.getItem('token');
				if (!token) {
					console.warn('No token found in localStorage. User may need to log in.');
					return;
				}
				
				// Try the profile endpoint
				const response = await fetch('/api/proxy?endpoint=profile', {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`
					}
				});
				
				if (response.ok) {
					const userData = await response.json();
					console.log('User profile loaded:', userData);
					
					// Extract user ID and name from the response
					let foundUserId = null;
					let foundUserName = null;
					
					// Check common API response structures for user ID
					if (userData.id) {
						foundUserId = userData.id;
						foundUserName = userData.name || userData.full_name || userData.nama;
					} else if (userData.user && userData.user.id) {
						foundUserId = userData.user.id;
						foundUserName = userData.user.name || userData.user.full_name || userData.user.nama;
					} else if (userData.data && userData.data.id) {
						foundUserId = userData.data.id;
						foundUserName = userData.data.name || userData.data.full_name || userData.data.nama;
					} else if (userData.data && userData.data.user && userData.data.user.id) {
						foundUserId = userData.data.user.id;
						foundUserName = userData.data.user.name || userData.data.user.full_name || userData.data.user.nama;
					}
					
					// Store user ID and name if found
					if (foundUserId) {
						console.log('✅ Found and setting user ID:', foundUserId);
						setUserId(foundUserId);
						localStorage.setItem('user_id', foundUserId.toString());
					}
					
					if (foundUserName) {
						console.log('✅ Found and setting user name:', foundUserName);
						setUserFullName(foundUserName);
						localStorage.setItem('user_name', foundUserName);
					}
				} else {
					console.error('Failed to load user profile:', response.status);
					
					// Try the fallback /api/user endpoint
					const userResponse = await fetch('/api/proxy?endpoint=user', {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${token}`
						}
					});
					
					if (userResponse.ok) {
						const userData = await userResponse.json();
						console.log('User data from fallback endpoint:', userData);
						
						// Process the user data with the same logic
						let foundUserId = null;
						let foundUserName = null;
						
						if (userData.id) {
							foundUserId = userData.id;
							foundUserName = userData.name || userData.full_name || userData.nama;
						} else if (userData.user && userData.user.id) {
							foundUserId = userData.user.id;
							foundUserName = userData.user.name || userData.user.full_name || userData.user.nama;
						} else if (userData.data && userData.data.id) {
							foundUserId = userData.data.id;
							foundUserName = userData.data.name || userData.data.full_name || userData.data.nama;
						}
						
						if (foundUserId) {
							console.log('✅ Found user ID from fallback:', foundUserId);
							setUserId(foundUserId);
							localStorage.setItem('user_id', foundUserId.toString());
						}
						
						if (foundUserName) {
							console.log('✅ Found user name from fallback:', foundUserName);
							setUserFullName(foundUserName);
							localStorage.setItem('user_name', foundUserName);
						}
					}
				}
			} catch (error) {
				console.error('Error fetching user profile:', error);
			}
		};
		
		// Execute in client-side only
		if (typeof window !== 'undefined') {
			fetchUserProfile();
		}
	}, []);

	const handleChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			
			// Get file extension
			const fileExtension = file.name.split('.').pop().toLowerCase();
			
			// Verify file size (for videos, limit to 2MB, for other files 10MB)
			const isVideo = file.type.startsWith('video/');
			const maxSize = isVideo ? 2 * 1024 * 1024 : 10 * 1024 * 1024; // 2MB for videos, 10MB for other files
			
			if (file.size > maxSize) {
				alert(`Ukuran file terlalu besar. Maksimum ${isVideo ? '2MB untuk video' : '10MB untuk file lain'}.`);
				return;
			}
			
			// Check file type with more specific mime type handling
			const validExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'mp4'];
			const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'video/mp4'];
			
			// Check both MIME type and extension
			if (!validTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {
				alert('Tipe file tidak didukung. Silakan unggah JPG, PNG, PDF, atau MP4.');
				console.log(`Rejected file: ${file.name}, type: ${file.type}, extension: ${fileExtension}`);
				return;
			}
			
			// If it's a video, do additional checks
			if (isVideo) {
				// For MP4 files, ensure we're explicit about the MIME type
				if (fileExtension === 'mp4' && file.type !== 'video/mp4') {
					console.warn('Fixing MIME type for MP4 file');
				}
				
				// Reduce the file size limit for videos even further if they're large
				if (file.size > 1.5 * 1024 * 1024) {
					console.warn('Video file is large. Upload might fail. Consider compressing it further.');
				}
			}
			
			// Generate a new unique filename
			const newFileName = `lampiran_${Date.now()}.${fileExtension}`;
			console.log(`File accepted: ${file.name}, new generated name: ${newFileName}`);
			
			setFormData(prev => ({
				...prev,
				lampiran: file,
				originalFileName: file.name,
				generatedFileName: newFileName, // Store the new name
				fileExtension: fileExtension,
				fileType: isVideo && fileExtension === 'mp4' ? 'video/mp4' : file.type // Force correct MIME type for MP4
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Basic validation
		if (!formData.judul?.trim()) {
			alert('Judul laporan diperlukan');
			return;
		}
		
		if (!formData.kategori?.trim()) {
			alert('Kategori diperlukan');
			return;
		}
		
		if (!formData.deskripsi?.trim()) {
			alert('Deskripsi diperlukan');
			return;
		}
		
		if (!formData.prioritas?.trim()) {
			alert('Prioritas diperlukan');
			return;
		}
		
		// Check if user ID is available
		if (!userId && !localStorage.getItem('user_id')) {
			alert('Tidak dapat menemukan ID pengguna. Silakan masuk kembali.');
			return;
		}
		
		setIsSubmitting(true); // Start the submitting process
		try {
			// Create FormData object for file upload
			const submissionData = new FormData();
			
			// Add user_id - this is the simplified key part
			const submittingUserId = userId || localStorage.getItem('user_id');
			submissionData.append('user_id', submittingUserId);
			console.log('✅ Adding user_id to submission:', submittingUserId);
			
			// Add name only if not anonymous - using the name from profile
			if (!isAnonymous && userFullName) {
				submissionData.append('nama_pelapor', userFullName);
			} else if (!isAnonymous && localStorage.getItem('user_name')) {
				submissionData.append('nama_pelapor', localStorage.getItem('user_name'));
			}
			
			// Add all form data
			submissionData.append('judul', formData.judul);
			submissionData.append('kategori', formData.kategori);
			submissionData.append('deskripsi', formData.deskripsi);
			submissionData.append('prioritas', formData.prioritas);
			
			// Add current date and time
			const now = new Date();
			const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
			const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
			
			submissionData.append('tanggal_lapor', currentDate);
			submissionData.append('waktu_lapor', currentTime);
			
			// Set initial status to 'Pending'
			submissionData.append('status', 'Pending');
			
			// Handle file upload
			if (formData.lampiran) {
				// Add the client-generated filename to the form data explicitly
				submissionData.append('lampiran_filename', formData.generatedFileName);

				// For video files, ensure we explicitly set the correct content type
				if (formData.fileType && formData.fileType.startsWith('video/')) {
					try {
						// Create a new Blob with the correct MIME type
						const videoBlob = formData.lampiran.slice(0, formData.lampiran.size, 'video/mp4');
						
						// Create a new File object with the generated filename and correct content type
						const videoFile = new File(
							[videoBlob],
							formData.generatedFileName, // Use the generated filename
							{ type: 'video/mp4' }
						);
						submissionData.append('lampiran', videoFile);
						
						// Add more explicit metadata about the file to help the server process it correctly
						submissionData.append('file_type', 'video/mp4');
						submissionData.append('is_video', 'true');
						submissionData.append('file_extension', formData.fileExtension || 'mp4');
						
						// Add field to explicitly indicate this is a file upload
						submissionData.append('has_attachment', 'true');
						
						console.log('Video file being sent with corrected MIME type:', {
							name: videoFile.name,
							size: videoFile.size,
							type: videoFile.type,
							extension: formData.fileExtension
						});
					} catch (error) {
						console.error('Error preparing video file:', error);
						// Fallback to original file with generated name
						const fallbackFile = new File([formData.lampiran], formData.generatedFileName, { type: formData.fileType });
						submissionData.append('lampiran', fallbackFile);
						submissionData.append('file_type', formData.fileType);
						submissionData.append('is_video', 'true');
					}
				} else {
					// For non-video files, create a new File object with the generated name
					const newFile = new File([formData.lampiran], formData.generatedFileName, { type: formData.fileType });
					submissionData.append('lampiran', newFile);
					
					// Still add the file type as metadata
					if (formData.fileType) {
						submissionData.append('file_type', formData.fileType);
					}
					if (formData.fileExtension) {
						submissionData.append('file_extension', formData.fileExtension);
					}
					
					// Add field to explicitly indicate this is a file upload
					submissionData.append('has_attachment', 'true');
					
					console.log('File being sent:', {
						name: newFile.name,
						size: newFile.size,
						type: newFile.type,
						extension: formData.fileExtension
					});
				}
			}
			
			// For debugging, log important data
			console.log('Submitting report with user_id:', submissionData.get('user_id'));
			
			// Get token for authorization header
			const token = localStorage.getItem('token');
			
			// Create a copy of the FormData for our proxy
			const proxyFormData = new FormData();
			
			// Copy all form data fields to the proxy FormData
			for (const [key, value] of submissionData.entries()) {
				proxyFormData.append(key, value);
			}
			
			// Add token to form data for proxy
			if (token) {
				proxyFormData.append('auth_token', token);
			}
			
			console.log('Using Next.js API proxy to avoid CORS issues');
			
			// Send FormData to our Next.js API proxy to bypass CORS restrictions
			const response = await fetch('/api/proxy?endpoint=laporan', {
				method: 'POST',
				body: proxyFormData
				// No need for headers, mode, or credentials as this is a same-origin request
			});
			
			// Handle different status codes with detailed error logging
			if (!response.ok) {
				let errorMessage = `Server responded with status: ${response.status}`;
				
				// Always try to get the response text first
				const responseText = await response.text();
				console.error('Error response raw text:', responseText);
				
				// Check if it's a 500 Internal Server Error specifically
				if (response.status === 500) {
					console.error('500 Internal Server Error detected');
					
					// Log more specific debugging information for PHP errors
					if (responseText.includes('Call to undefined function') || 
						responseText.includes('Fatal error') ||
						responseText.includes('Warning') ||
						responseText.includes('Notice')) {
						console.error('PHP error detected in response. PHP error details may be found in responseText above.');
					}
				}
				
				// Check if it's a 422 Validation Error specifically
				if (response.status === 422) {
					console.error('422 Validation Error detected. This typically means the file or data was rejected by the server.');
					
					try {
						// Try to parse the validation errors if they're in a structured format
						const errorData = JSON.parse(responseText);
						if (errorData.errors) {
							console.error('Validation error details:', errorData.errors);
							
							// Check for specific file-related validation errors
							if (errorData.errors.lampiran) {
								errorMessage = `File error: ${errorData.errors.lampiran.join(', ')}`;
							}
						}
					} catch (e) {
						// If not parseable JSON, continue with normal error handling
					}
				}
				
				// Check if it looks like HTML (common error page)
				if (responseText.trim().startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
					console.error('Received HTML error page instead of JSON response');
					errorMessage = `Server error (${response.status}) - Received HTML instead of JSON.`;
				} else {
					// Try to parse as JSON
					try {
						const errorData = JSON.parse(responseText);
						console.error('Error response as JSON:', errorData);
						
						if (errorData.message) {
							errorMessage = errorData.message;
						} else if (errorData.error) {
							errorMessage = errorData.error;
						}
					} catch (jsonError) {
						// Not JSON, use the text as is if it's not too long
						if (responseText.length < 100) {
							errorMessage += ` - ${responseText}`;
						}
					}
				}
				
				throw new Error(errorMessage);
			}
			
			// Process the response
			let result;
			try {
				result = await response.json();
				console.log("Report created successfully:", result);
				
				// Log and store file path information if available
				if (result.localFilePath) {
					console.log("Local file path:", result.localFilePath);
				}
				
				// The server might still send back its own filename, which we can log.
				if (result.localFileName) {
					console.log("Filename from server:", result.localFileName);
				}
				
				// Log all fields returned from the server to help debugging
				console.log("All fields returned from server:");
				Object.keys(result).forEach(key => {
					console.log(`- ${key}: ${result[key]}`);
				});
			} catch (jsonErr) {
				console.log("Report submitted successfully, response was not JSON");
			}
			
			// Show success notification modal
			setShowSuccessModal(true);
			
			// Reset form after submission
			setFormData({
				judul: '',
				kategori: '',
				deskripsi: '',
				prioritas: '',
				lampiran: null,
				generatedFileName: null,
				originalFileName: null,
				fileType: null,
				fileExtension: null
			});
		} catch (error) {
			console.error('Error submitting form:', error);
			
			// Show more user-friendly error messages based on status codes
			if (error.message.includes('Validation Error')) {
				// For validation errors, provide more helpful guidance
				if (formData.fileType && formData.fileType.startsWith('video/')) {
					alert(`File video tidak dapat diunggah. Kemungkinan penyebabnya:\n- Ukuran file terlalu besar (maks. 5MB)\n- Format tidak didukung (hanya MP4)\n- Durasi video terlalu panjang\n\nSilakan coba dengan file yang lebih kecil atau format yang berbeda.`);
				} else {
					alert(`Validasi gagal: ${error.message}\n\nPastikan semua field diisi dengan benar dan format file didukung (JPG, PNG, PDF, MP4).`);
				}
			} else {
				// For other errors, show the general error message
				alert(`Terjadi kesalahan saat mengirim laporan: ${error.message}`);
			}
		} finally {
			setIsSubmitting(false); // End the submitting process
		}
	};

	// Add global styles to prevent hover effects, but exclude sidebar navigation
	useEffect(() => {
		const style = document.createElement('style');
		style.innerHTML = `
      .no-hover-effect,
      .no-hover-effect *,
      .no-hover-effect *:hover {
        scale: none !important;
        box-shadow: inherit !important;
      }
      
      /* Ensure sidebar icons remain visible */
      .icon-container, 
      .icon-container * {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
    `;
		document.head.appendChild(style);

		return () => {
			document.head.removeChild(style);
		};
	}, []);

	return (
		<div className="max-w-2xl mx-auto">
			<h1 className="text-2xl font-bold mb-6">Buat Laporan Baru</h1>

			{/* Success Notification Modal */}
			<Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center">
							<CheckCircle className="text-green-500 mr-2 h-6 w-6" />
							Laporan Berhasil Dikirim
						</DialogTitle>
					</DialogHeader>
					{/* Don't use p tags inside DialogDescription as it's already a p tag */}
					<div className="space-y-4 pt-4 pb-2 text-center">
						<DialogDescription className="text-base font-medium">
							Terima kasih telah melaporkan!
						</DialogDescription>
						<DialogDescription className="text-sm text-gray-600">
							Laporan Anda telah berhasil dikirim ke sistem. Tim kami akan memproses laporan Anda 
							secepatnya. Anda bisa melihat status laporan di halaman riwayat.
						</DialogDescription>
					</div>
					<DialogFooter className="sm:justify-center">
						<Button 
							variant="default" 
							onClick={() => {
								setShowSuccessModal(false);
								// Optional: redirect to history page
								// window.location.href = '/user/history';
							}}
							className="mt-2"
						>
							Tutup
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Card className="p-6 space-y-6 no-hover-effect" style={{ transition: 'none', transform: 'none' }}>
				<form onSubmit={handleSubmit} className="space-y-4">
					{!isAnonymous && (
						<div>
							<Label htmlFor="nama_pelapor">Nama Pelapor</Label>
							<Input
								id="nama_pelapor"
								placeholder={userFullName ? '' : 'Memuat nama...'}
								className="no-hover-effect bg-gray-100"
								value={userFullName}
								readOnly
								disabled
								title="Nama diambil dari profil Anda"
							/>
							{!userFullName && (
								<p className="text-sm text-amber-600 mt-1">
									Memuat nama dari profil Anda...
								</p>
							)}
						</div>
					)}
					
					<div>
						<Label htmlFor="judul">Judul Laporan</Label>
						<Input 
							id="judul"
							placeholder="Masukkan judul laporan" 
							className="no-hover-effect" 
							value={formData.judul}
							onChange={(e) => handleChange('judul', e.target.value)}
							required
						/>
					</div>

					<div>
						<Label htmlFor="kategori">Kategori</Label>
						<Select 
							value={formData.kategori} 
							onValueChange={(value) => handleChange('kategori', value)}
						>
							<SelectTrigger className="no-hover-effect">
								<SelectValue placeholder="Pilih kategori" />
							</SelectTrigger>
							<SelectContent className="no-hover-effect">
								{categories.map((category) => (
									<SelectItem key={category.value} value={category.value} className="no-hover-effect">
										{category.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="deskripsi">Deskripsi</Label>
						<Textarea 
							id="deskripsi"
							placeholder="Jelaskan detail laporan Anda" 
							className="min-h-[150px]"
							value={formData.deskripsi}
							onChange={(e) => handleChange('deskripsi', e.target.value)}
							required
						/>
					</div>

					<div>
						<Label htmlFor="prioritas">Prioritas</Label>
						<Select 
							value={formData.prioritas} 
							onValueChange={(value) => handleChange('prioritas', value)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Pilih prioritas" />
							</SelectTrigger>
							<SelectContent>
								{priorities.map((priority) => (
									<SelectItem key={priority.value} value={priority.value}>
										{priority.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="lampiran">Lampiran</Label>
						<div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer" 
							onClick={() => document.getElementById('lampiran').click()}>
							<Input 
								id="lampiran"
								type="file" 
								className="hidden" 
								onChange={handleFileChange}
								accept=".jpg,.jpeg,.png,.pdf,.mp4"
							/>
							<div className="flex flex-col items-center">
								<Button type="button" variant="outline" className="no-hover-effect mb-2">
									<Upload className="mr-2 h-4 w-4" />
									Unggah File
								</Button>
								{formData.lampiran ? (
									<div className="mt-2 text-sm">
										<p className="font-medium text-green-600">File dipilih: {formData.lampiran.name}</p>
										<p className="text-gray-500">Ukuran: {(formData.lampiran.size / (1024 * 1024)).toFixed(2)} MB</p>
									</div>
								) : (
									<p className="text-sm text-gray-500 mt-2">
										Klik untuk memilih file dari perangkat Anda<br/>
										Mendukung: JPG, PNG, PDF (Max. 10MB), MP4 (Max. 2MB)
									</p>
								)}
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center space-x-2">
							<Switch
								id="anonymous"
								checked={isAnonymous}
								onCheckedChange={(value) => {
									setIsAnonymous(value);
								}}
								className="no-hover-effect"
							/>
							<Label htmlFor="anonymous">Sembunyikan identitas saya</Label>
						</div>
						<p className="text-xs text-gray-500">
							{isAnonymous 
								? "Identitas Anda akan disembunyikan dalam laporan ini." 
								: userFullName 
									? `Laporan akan menggunakan nama Anda: ${userFullName}`
									: "Laporan akan menggunakan nama dari profil Anda setelah dimuat."}
						</p>
					</div>

					<Button type="submit" className="w-full no-hover-effect" variant="accent" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<span className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin mr-2 inline-block"></span>
								Mengirim...
							</>
						) : 'Kirim Laporan'}
					</Button>
				</form>
			</Card>
		</div>
	);
}
