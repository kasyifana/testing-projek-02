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

// Program study options grouped by category
const programStudyOptions = [
	{
		category: "PROGRAM STUDI DIPLOMA (D3)",
		items: [
			{ value: "d3_analisis_kimia", label: "Ahli Madya (D3) Analisis Kimia" }
		]
	},
	{
		category: "PROGRAM STUDI SARJANA TERAPAN",
		items: [
			{ value: "st_akuntansi_perpajakan", label: "Sarjana Terapan Akuntansi Perpajakan" },
			{ value: "st_analisis_keuangan", label: "Sarjana Terapan Analisis Keuangan" },
			{ value: "st_bisnis_digital", label: "Sarjana Terapan Bisnis Digital" },
		]
	},
	{
		category: "PROGRAM STUDI SARJANA (S1)",
		items: [
			{ value: "s1_akuntansi", label: "Sarjana Akuntansi" },
			{ value: "s1_arsitektur", label: "Sarjana Arsitektur" },
			{ value: "s1_ekonomi_islam", label: "Sarjana Ekonomi (Ekonomi Islam)" },
			{ value: "s1_ekonomi_pembangunan", label: "Sarjana Ekonomi (Ekonomi Pembangunan)" },
			{ value: "s1_farmasi", label: "Sarjana Farmasi" },
			{ value: "s1_hubungan_internasional", label: "Sarjana Hubungan Internasional" },
			{ value: "s1_hukum_keluarga", label: "Sarjana Hukum (Hukum Keluarga/Ahwal Syakhshiyah)" },
			{ value: "s1_hukum", label: "Sarjana Hukum" },
			{ value: "s1_hukum_bisnis", label: "Sarjana Hukum Bisnis" },
			{ value: "s1_ilmu_komunikasi", label: "Sarjana Ilmu Komunikasi" },
			{ value: "s1_kedokteran", label: "Sarjana Kedokteran" },
			{ value: "s1_informatika", label: "Sarjana Komputer (Informatika)" },
			{ value: "s1_manajemen", label: "Sarjana Manajemen" },
			{ value: "s1_pendidikan_agama_islam", label: "Sarjana Pendidikan (Pendidikan Agama Islam)" },
			{ value: "s1_pendidikan_bahasa_inggris", label: "Sarjana Pendidikan (Pendidikan Bahasa Inggris)" },
			{ value: "s1_pendidikan_kimia", label: "Sarjana Pendidikan (Pendidikan Kimia)" },
			{ value: "s1_psikologi", label: "Sarjana Psikologi" },
			{ value: "s1_kimia", label: "Sarjana Sains (Kimia)" },
			{ value: "s1_statistika", label: "Sarjana Statistika" },
			{ value: "s1_rekayasa_tekstil", label: "Sarjana Teknik (Rekayasa Tekstil)" },
			{ value: "s1_manajemen_rekayasa", label: "Sarjana Teknik (Manajemen Rekayasa)" },
			{ value: "s1_teknik_elektro", label: "Sarjana Teknik (Teknik Elektro)" },
			{ value: "s1_teknik_industri", label: "Sarjana Teknik (Teknik Industri)" },
			{ value: "s1_teknik_kimia", label: "Sarjana Teknik (Teknik Kimia)" },
			{ value: "s1_teknik_lingkungan", label: "Sarjana Teknik (Teknik Lingkungan)" },
			{ value: "s1_teknik_mesin", label: "Sarjana Teknik (Teknik Mesin)" },
			{ value: "s1_teknik_sipil", label: "Sarjana Teknik (Teknik Sipil)" },
		]
	},
	{
		category: "PROGRAM STUDI MAGISTER (S2)",
		items: [
			{ value: "s2_akuntansi", label: "Magister Akuntansi" },
			{ value: "s2_arsitektur", label: "Magister Arsitektur" },
			{ value: "s2_farmasi", label: "Magister Farmasi" },
			{ value: "s2_hukum", label: "Magister Hukum" },
			{ value: "s2_kenotariatan", label: "Magister Kenotariatan" },
			{ value: "s2_manajemen", label: "Magister Manajemen" },
			{ value: "s2_ilmu_agama_islam", label: "Magister Ilmu Agama Islam" },
			{ value: "s2_ilmu_ekonomi", label: "Magister Ilmu Ekonomi" },
			{ value: "s2_statistika", label: "Magister Statistika" },
			{ value: "s2_kesehatan_masyarakat", label: "Magister Kesehatan Masyarakat" },
			{ value: "s2_informatika", label: "Magister Komputer (Informatika)" },
			{ value: "s2_rekayasa_elektro", label: "Magister Teknik (Rekayasa Elektro)" },
			{ value: "s2_teknik_industri", label: "Magister Teknik (Teknik Industri)" },
			{ value: "s2_teknik_kimia", label: "Magister Teknik (Teknik Kimia)" },
			{ value: "s2_teknik_lingkungan", label: "Magister Teknik (Teknik Lingkungan)" },
			{ value: "s2_teknik_sipil", label: "Magister Teknik (Teknik Sipil)" },
			{ value: "s2_kimia", label: "Magister Sains (Kimia)" },
			{ value: "s2_psikologi", label: "Magister Psikologi" },
			{ value: "s2_ilmu_komunikasi", label: "Magister Ilmu Komunikasi" },
		]
	},
	{
		category: "PROGRAM STUDI DOKTOR (S3)",
		items: [
			{ value: "s3_hukum", label: "Doktor Hukum" },
			{ value: "s3_hukum_islam", label: "Doktor Hukum Islam" },
			{ value: "s3_ilmu_ekonomi", label: "Doktor Ilmu Ekonomi" },
			{ value: "s3_manajemen", label: "Doktor Manajemen" },
			{ value: "s3_teknik_sipil", label: "Doktor Teknik Sipil" },
			{ value: "s3_rekayasa_industri", label: "Doktor Rekayasa Industri" },
		]
	},
	{
		category: "PROGRAM PROFESI",
		items: [
			{ value: "prof_arsitek", label: "Program Profesi Arsitek" },
			{ value: "prof_dokter", label: "Program Profesi Dokter" },
			{ value: "prof_apoteker", label: "Pendidikan Profesi Apoteker" },
			{ value: "prof_psikologi", label: "Pendidikan Profesi Psikologi" },
		]
	},
];

// Flatten the options for easier search
const flatProgramStudyOptions = programStudyOptions.flatMap(group => 
	group.items.map(item => ({ value: item.value, label: item.label }))
);

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
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const [successAnimation, setSuccessAnimation] = useState(null);
	
	useEffect(() => {
		// Use exactly the same animation URL as LogoutDialog
		fetch('https://assets5.lottiefiles.com/private_files/lf30_ulp9xiqw.json')
			.then(response => response.json())
			.then(data => {
				setSuccessAnimation(data);
			})
			.catch(error => {
				console.error("Failed to load animation:", error);
			});
	}, []);
	
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

	const watchRole = form.watch('role');

	function onSubmit(data) {
		console.log("Form submitted with data:", data);
		
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
														</div>

														{/* Program list with max height and scrollable */}
														<div className="max-h-[240px] overflow-y-auto p-1">
															{programStudyOptions.map((group) => (
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
															))}
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
