'use client';

import { useToast } from '@/components/ui/use-toast'; // Matches LogoutDialog import
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Lock, User, X, Check, ChevronsUpDown, GraduationCap, Briefcase, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Lottie from 'lottie-react';
import { useRouter } from 'next/navigation';

// Helper function to group programs by degree level
const groupProgramsByLevel = (programList) => {
	const groups = {
		'D3': [],
		'Sarjana Terapan': [],
		'S1': [],
		'S2': [],
		'S3': [],
		'Profesi': []
	};
	
	programList.forEach(program => {
		const code = program.code || '';
		const name = program.name || '';
		const value = program.code || program.id?.toString() || '';
		
		// Determine category based on code prefix
		if (code.startsWith('d3_')) {
			groups['D3'].push({ value, label: name });
		} else if (code.startsWith('st_')) {
			groups['Sarjana Terapan'].push({ value, label: name });
		} else if (code.startsWith('s1_')) {
			groups['S1'].push({ value, label: name });
		} else if (code.startsWith('s2_')) {
			groups['S2'].push({ value, label: name });
		} else if (code.startsWith('s3_')) {
			groups['S3'].push({ value, label: name });
		} else if (code.startsWith('prof_')) {
			groups['Profesi'].push({ value, label: name });
		} else {
			// Default to S1 if no clear category
			groups['S1'].push({ value, label: name });
		}
	});
	
	// Convert to the format expected by the component and filter out empty groups
	return Object.entries(groups)
		.filter(([category, items]) => items.length > 0)
		.map(([category, items]) => ({
			category,
			items: items.sort((a, b) => a.label.localeCompare(b.label))
		}));
};

// Empty initialization - will be populated from database

const registerSchema = z.object({
	name: z.string().min(2, { message: 'Nama minimal 2 karakter.' }),
	email: z.string().email({ message: 'Format email tidak valid.' }),
	password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
	confirmPassword: z.string().min(6, { message: 'Konfirmasi password minimal 6 karakter.' }),
	role: z.enum(['mahasiswa', 'tenaga_pendidik'], {
		required_error: "Silahkan pilih peran Anda.",
	}),
	programStudy: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Konfirmasi password tidak sesuai",
	path: ["confirmPassword"],
}).refine(
	(data) => data.role !== 'mahasiswa' || (data.role === 'mahasiswa' && data.programStudy && data.programStudy.length > 0),
	{
		message: "Program studi wajib diisi untuk mahasiswa",
		path: ["programStudy"],
	}
);

export function RegisterDialog({ isOpen, onClose }) {
	const router = useRouter();
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const [successAnimation, setSuccessAnimation] = useState(null);
	const [programStudyOptions, setProgramStudyOptions] = useState([]);
	const [flatProgramStudyOptions, setFlatProgramStudyOptions] = useState([]);
	const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
	useEffect(() => {
		// Use exactly the same animation URL as LogoutDialog
		fetch('https://assets5.lottiefiles.com/private_files/lf30_ulp9xiqw.json')
			.then(response => response.json())
			.then(data => {
				setSuccessAnimation(data);
			})
			.catch(error => {
				console.error("Failed to load animation:", error);
			});		// Fetch program study options from external PHP API
		setIsLoadingPrograms(true);
		fetch('https://laravel.kasyifana.my.id/api/program-studi', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			mode: 'cors', // Enable CORS for external API
		})
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				console.log("Fetched program study data:", data);
				
				// Handle different response formats
				let programList = [];
				if (data.data && Array.isArray(data.data)) {
					programList = data.data;
				} else if (Array.isArray(data)) {
					programList = data;
				} else if (data.success && data.data) {
					programList = data.data;
				} else {
					throw new Error('Invalid API response format');
				}
				
				// Check for API errors
				if (data.error) {
					console.error("Error from API:", data.error);
					throw new Error(data.error);
				}
				
				// Group programs by degree level
				const groupedPrograms = groupProgramsByLevel(programList);
				setProgramStudyOptions(groupedPrograms);
				
				// Flatten the options for easier search
				const flatOptions = groupedPrograms.flatMap(group => 
					group.items.map(item => ({ value: item.value, label: item.label }))
				);
				setFlatProgramStudyOptions(flatOptions);
			})			.catch(error => {
				console.error("Failed to load program study data:", error);
				
				// Provide more specific error messages
				let errorMessage = "Failed to load program study data. ";
				if (error.message.includes('CORS')) {
					errorMessage += "CORS error - please check server configuration.";
				} else if (error.message.includes('HTTP error')) {
					errorMessage += "Server returned an error. Please check the API endpoint.";
				} else if (error.message.includes('fetch')) {
					errorMessage += "Network error - please check your connection and server.";
				} else {
					errorMessage += "Please try again later.";
				}
				
				// Fallback empty structure in case of error
				setProgramStudyOptions([]);
				setFlatProgramStudyOptions([]);
				
				// Show toast with error
				toast({
					title: "Error Loading Program Studies",
					description: errorMessage,
					variant: "destructive"
				});
			})
			.finally(() => {
				setIsLoadingPrograms(false);
			});
	}, [toast]);
	
	const form = useForm({
		resolver: zodResolver(registerSchema),
		defaultValues: { 
			name: '',
			email: '', 
			password: '',
			confirmPassword: '',
			role: undefined,
			programStudy: '',
		},
	});

	const watchRole = form.watch('role');	function onSubmit(data) {
		console.log("Form submitted with data:", data);
		
		// Send registration data to external PHP API endpoint
		fetch('https://laravel.kasyifana.my.id/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			mode: 'cors', // Enable CORS for external API
			body: JSON.stringify(data),		})
		.then(async response => {
			const responseData = await response.json();
			console.log("API Response:", { status: response.status, data: responseData });
			
			// Jika response 422, ambil pesan validasi error dari server
			if (response.status === 422) {
				// Format Laravel validation error messages
				if (responseData.errors) {
					// Ambil pesan error pertama dari setiap field
					const errorMessages = Object.values(responseData.errors)
						.map(errors => errors[0])
						.join(', ');
					throw new Error(`Validation error: ${errorMessages}`);
				} else if (responseData.message) {
					throw new Error(responseData.message);
				}
			}
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			return responseData;
		}).then(result => {
			console.log("Registration API response:", result);			// Check for success in different API response formats
			const isSuccess = 
				result.success || // format: { success: true, ... }
				(result.message && result.message.includes("success")) || // format: { message: "Registration successful" }
				(result.status && result.status === 201) || // format: { status: 201, ... }
				(result.id && result.name) || // format: direct user object returned
				result.user; // format: { user: {...} } - respons pengembalian user
				
			if (isSuccess) {
				// Make toast exactly like in LogoutDialog
				toast({
					title: 'Registrasi Berhasil!',
					description: `Akun untuk ${data.name} telah berhasil dibuat. Silahkan login untuk melanjutkan.`,
					action: successAnimation ? (
						<div className="w-20 h-20 mx-auto">
							<Lottie
								animationData={successAnimation}
								loop={true}
								autoplay={true}
							/>
						</div>
					) : (
						<div className="w-20 h-20 mx-auto flex items-center justify-center">
							<UserPlus className="h-10 w-10 text-green-500" />
						</div>
					),
				}); // No custom classes, duration, or variant - exactly like LogoutDialog
				
				// Store login info
				localStorage.setItem('isLoggedIn', 'true');
				localStorage.setItem('userName', data.name);
				
				// Add a small delay before closing the dialog
				setTimeout(() => {
					onClose();
					form.reset();
				}, 1500);
				
				// Redirect to home after successful registration
				setTimeout(() => {
					localStorage.removeItem('isLoggedIn');
					localStorage.removeItem('userName');
					router.push('/');
				}, 1500); // Delay for toast/animation
			} else {
				// Show backend error message if available
				toast({
					title: 'Registration Failed',
					description: result.message || 'An error occurred during registration. Please try again.',
					variant: 'destructive',
				});
				
				console.error("Registration failed with response:", result);
			}
		})		.catch(error => {
			console.error('Error during registration:', error);
			
			// Provide more specific error messages
			let errorMessage = "";
			if (error.message.includes('Validation error:')) {
				// Gunakan pesan validasi langsung dari server
				errorMessage = error.message;
			} else if (error.message.includes('CORS')) {
				errorMessage = "CORS error - please check server configuration.";
			} else if (error.message.includes('HTTP error')) {
				errorMessage = "Server returned an error. Please check the API endpoint.";
			} else if (error.message.includes('fetch')) {
				errorMessage = "Network error - please check your connection and server.";
			} else {
				errorMessage = "An error occurred during registration. Please try again.";
			}
			
			toast({
				title: 'Registration Failed',
				description: errorMessage,
				variant: 'destructive',
			});
		});
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
				>
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</button>
				
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-bold">Buat Akun</DialogTitle>
					<DialogDescription className="text-center">
						Lengkapi data berikut untuk membuat akun baru.
					</DialogDescription>
				</DialogHeader>
				
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{/* Name field */}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nama Lengkap</FormLabel>
									<FormControl>
										<div className="relative">
											<User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
											<Input placeholder="Nama lengkap Anda" {...field} className="pl-10" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Email field */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
											<Input type="email" placeholder="contoh@email.com" {...field} className="pl-10" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Role field */}
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel>Peran</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={(value) => {
												field.onChange(value);
												// Reset program study when changing role
												if (value !== 'mahasiswa') {
													form.setValue('programStudy', '');
												}
											}}
											value={field.value}
											className="flex flex-col space-y-1"
										>
											<FormItem className="flex items-center space-x-3 space-y-0">
												<FormControl>
													<RadioGroupItem value="mahasiswa" />
												</FormControl>
												<FormLabel className="font-normal cursor-pointer flex items-center">
													<GraduationCap className="mr-2 h-4 w-4" />
													Mahasiswa
												</FormLabel>
											</FormItem>
											<FormItem className="flex items-center space-x-3 space-y-0">
												<FormControl>
													<RadioGroupItem value="tenaga_pendidik" />
												</FormControl>
												<FormLabel className="font-normal cursor-pointer flex items-center">
													<Briefcase className="mr-2 h-4 w-4" />
													Tenaga Pendidik
												</FormLabel>
											</FormItem>
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Program Study field - only shown when role is 'mahasiswa' */}
						{watchRole === 'mahasiswa' && (
							<FormField
								control={form.control}
								name="programStudy"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Program Studi</FormLabel>
										<FormControl>
											<div className="flex flex-col w-full">
												{/* Selected value display */}
												<div 
													className="flex w-full justify-between items-center border rounded-md p-2 px-3 mb-2 cursor-pointer"
													onClick={() => setOpen(!open)}
												>
													<span className={!field.value ? "text-muted-foreground" : ""}>
														{field.value
															? flatProgramStudyOptions.find(
																(option) => option.value === field.value
															)?.label
															: "Pilih program studi..."}
													</span>
													<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
												</div>

												{/* Dropdown section - directly in the page, not in a popover */}
												{open && (
													<div className="border rounded-md w-full bg-background shadow-sm">
														{/* Search input */}
														<div className="flex items-center border-b px-3 py-2">
															<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
															<input
																className="flex w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
																placeholder="Cari program studi..."
																onChange={(e) => {
																	// Filter options based on search input
																	const searchValue = e.target.value.toLowerCase();
																	const programElements = document.querySelectorAll('.program-item');
																	const groupElements = document.querySelectorAll('.program-group');
																	
																	programElements.forEach(el => {
																		const text = el.textContent.toLowerCase();
																		const shouldShow = text.includes(searchValue);
																		el.style.display = shouldShow ? 'flex' : 'none';
																	});
																	
																	// Show/hide group headers based on if they have visible children
																	groupElements.forEach(group => {
																		const visibleChildren = group.querySelectorAll('.program-item[style="display: flex;"]');
																		group.style.display = visibleChildren.length > 0 ? 'block' : 'none';
																	});
																}}
															/>
														</div>												{/* Program list with max height and scrollable */}
														<div className="max-h-[240px] overflow-y-auto p-1">
															{isLoadingPrograms ? (
																<div className="flex justify-center items-center p-4">
																	<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
																	<span className="ml-2">Loading...</span>
																</div>
															) : programStudyOptions.length === 0 ? (
																<div className="text-center py-4 text-muted-foreground">
																	No program studies available
																</div>
															) : (
																programStudyOptions.map((group) => (
																	<div key={group.category} className="program-group">
																		<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
																			{group.category}
																		</div>
																		{group.items.map((option) => (
																			<div
																				key={option.value}
																				className={`
																					program-item flex items-center rounded-sm px-2 py-2 text-sm cursor-pointer
																					${option.value === field.value ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}
																				`}
																				onClick={() => {
																					form.setValue("programStudy", option.value, { shouldValidate: true });
																					console.log("Selected program:", option.value);
																					setOpen(false);
																				}}
																			>
																				<Check
																					className={cn(
																						"mr-2 h-4 w-4",
																						option.value === field.value
																							? "opacity-100"
																							: "opacity-0"
																					)}
																				/>
																				<span>{option.label}</span>
																			</div>
																		))}
																	</div>
																))
															)}
														</div>
													</div>
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{/* Password field */}
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
											<Input type="password" placeholder="••••••••" {...field} className="pl-10" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						{/* Confirm Password field */}
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Konfirmasi Password</FormLabel>
									<FormControl>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
											<Input type="password" placeholder="••••••••" {...field} className="pl-10" />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<Button type="submit" className="w-full" variant="accent">
							<UserPlus className="mr-2 h-5 w-5" /> Register
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
