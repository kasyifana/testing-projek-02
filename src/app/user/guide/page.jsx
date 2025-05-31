'use client';

import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ_ITEMS = [
	{
		question: "Bagaimana cara membuat laporan?",
		answer:
			"Klik tombol 'Buat Laporan Baru' di dashboard atau menu samping. Isi formulir dengan lengkap termasuk judul, kategori, dan deskripsi. Tambahkan lampiran jika diperlukan.",
	},
	{
		question: "Berapa lama laporan akan ditanggapi?",
		answer:
			"Laporan biasanya ditanggapi dalam 1-3 hari kerja. Untuk laporan mendesak, tanggapan diberikan dalam 24 jam.",
	},
	{
		question: "Bagaimana cara mengaktifkan laporan anonim?",
		answer:
			"Saat membuat laporan, centang opsi 'Sembunyikan identitas saya' di bagian bawah formulir.",
	},
];

// CSS to prevent hover scaling
const noHoverScaleStyle = {
	transform: "none !important",
	transition: "none !important",
};

export default function Guide() {
	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<h1 className="text-2xl font-bold">Panduan & Kebijakan</h1>

			<Card className="p-6 hover:scale-100" style={noHoverScaleStyle}>
				<h2 className="text-xl font-semibold mb-4">FAQ</h2>
				<Accordion type="single" collapsible className="hover:scale-100">
					{FAQ_ITEMS.map((item, index) => (
						<AccordionItem
							key={index}
							value={`item-${index}`}
							className="hover:scale-100"
							style={noHoverScaleStyle}
						>
							<AccordionTrigger
								className="hover:scale-100"
								style={noHoverScaleStyle}
							>
								{item.question}
							</AccordionTrigger>
							<AccordionContent>{item.answer}</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</Card>

			<Card className="p-6 hover:scale-100" style={noHoverScaleStyle}>
				<h2 className="text-xl font-semibold mb-4">Kebijakan Privasi</h2>
				<div className="prose">
					<p>Data yang kami kumpulkan:</p>
					<ul className="list-disc pl-6">
						<li>Informasi profil dasar (nama, email)</li>
						<li>Isi laporan yang Anda buat</li>
						<li>Lampiran yang Anda unggah</li>
					</ul>
					<p className="mt-4">Kami berkomitmen untuk:</p>
					<ul className="list-disc pl-6">
						<li>Tidak membagikan data pribadi Anda</li>
						<li>Mengenkripsi semua informasi sensitif</li>
						<li>Menghapus data sesuai permintaan</li>
					</ul>
				</div>
			</Card>
		</div>
	);
}
