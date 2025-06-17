import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OSINT News Aggregator",
  description: "A collection of news from various Telegraph channels, translated to English, tagged, then published in a feed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<html lang='en'>
			<head>
				<meta name='apple-mobile-web-app-title' content='OSINT' />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} background-[#cd34cd] antialiased`}>
				{children}
			</body>
		</html>
  );
}
