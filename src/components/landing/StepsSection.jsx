import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Workflow } from 'lucide-react';
import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Updated array with more reliable Lottie animation URLs
const stepsData = [
	{
		animationUrl:
			'https://assets1.lottiefiles.com/packages/lf20_zrqthn6o.json', // Form filling animation
		title: 'Buat Laporan',
		description:
			'Isi formulir laporan dengan detail masalah yang kamu temukan di lingkungan kampus.',
	},
	{
		animationUrl:
			'https://assets9.lottiefiles.com/packages/lf20_49rdyysj.json', // Verification/shield animation
		title: 'Verifikasi Laporan',
		description:
			'Tim kami akan memverifikasi laporanmu untuk memastikan validitas dan kelengkapan informasi.',
	},
	{
		animationUrl:
			'https://lottie.host/8984152e-6bf9-4732-b8ae-9a5d9faa7f34/HKhgCo6A5p.json', // Message sending animation
		title: 'Tindak Lanjut',
		description:
			'Laporan diteruskan ke pihak berwenang di kampus untuk diproses dan ditindaklanjuti.',
	},
	{
		// Using a different animation that should work more reliably
		animationUrl:
			'https://lottie.host/6bf0c0e8-a479-411f-885e-abfcccdc84ae/ia0eFiEWKw.json',
		title: 'Pantau Progres',
		description:
			'Kamu bisa memantau status dan progres penyelesaian laporanmu melalui platform.',
	},
];

function AnimationLoader({ url }) {
	// Add a backup animation for the fourth card if URL fails
	const [animationData, setAnimationData] = useState(null);
	const [error, setError] = useState(false);
	const [index, setIndex] = useState(0);
	
	// Find the index of this animation in stepsData
	useEffect(() => {
		const idx = stepsData.findIndex(step => step.animationUrl === url);
		if (idx !== -1) {
			setIndex(idx);
		}
	}, [url]);

	useEffect(() => {
		let isMounted = true;
		
		fetch(url)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Network response not ok: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				if (isMounted) {
					setAnimationData(data);
				}
			})
			.catch((error) => {
				console.error('Error loading animation:', error);
				if (isMounted) {
					setError(true);
				}
			});
			
		return () => {
			isMounted = false;
		};
	}, [url]);

	// Create static fallback icons based on the step
	if (error || !animationData) {
		let iconContent;
		
		// Create appropriate static content for each card
		if (index === 0) {
			iconContent = "📝";  // Form icon
		} else if (index === 1) {
			iconContent = "✅";  // Verify icon
		} else if (index === 2) {
			iconContent = "📨";  // Send icon 
		} else if (index === 3) {
			iconContent = "📊";  // Progress icon
		} else {
			iconContent = "⚙️";  // Generic icon
		}
		
		return (
			<div className="h-24 w-24 bg-accent/10 rounded-full flex items-center justify-center text-4xl">
				{iconContent}
			</div>
		);
	}

	return (
		<Lottie
			animationData={animationData}
			loop={true}
			className="h-24 w-24"
		/>
	);
}

export function StepsSection() {
	return (
		<section id="cara-kerja" className="py-16 sm:py-24 bg-secondary">
			<div className="container mx-auto px-6 lg:px-8">
				<div className="text-center mb-16">
					<Workflow className="h-12 w-12 mx-auto mb-4 text-primary" />
					<h2 className="text-3xl sm:text-4xl font-bold text-primary">
						Bagaimana Cara Kerja Lapor Kampus?
					</h2>
					<p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
						Laporkan masalah di kampusmu dengan mudah melalui beberapa langkah
						sederhana.
					</p>
				</div>
				<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
					{stepsData.map((step, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, x: 100 }} // Start from right side
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{ 
								duration: 1, // Reduced from 0.8 to 0.5 seconds
								delay: index * 0.8, // Reduced from 1 second to 0.3 seconds between each step
								ease: "easeOut" 
							}}
							className="h-full" // Add height full to the motion container
						>
							<Card
								className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col p-2 h-full"
							>
								<CardHeader className="items-center text-center pb-6">
									<div className="p-2 bg-accent/10 rounded-full mb-6 flex items-center justify-center">
										<AnimationLoader url={step.animationUrl} />
									</div>
									<CardTitle className="text-xl text-primary">
										{step.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="text-center flex-grow flex items-center justify-center px-6">
									<CardDescription className="text-md leading-relaxed">
										{step.description}
									</CardDescription>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}
