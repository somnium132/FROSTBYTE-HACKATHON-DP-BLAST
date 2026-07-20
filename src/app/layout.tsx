import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://frostbyte-hackathon-dp-blast.vercel.app/"),
  title: "FROSTBYTE DP Blast | Youth Week Hackathon",
  description: "Customize your profile picture with the official FROSTBYTE: Youth Week Hackathon DP frames overlay and share it on social media to show your support!",
  openGraph: {
    title: "FROSTBYTE DP Blast | Youth Week Hackathon",
    description: "Customize your profile picture with the official FROSTBYTE: Youth Week Hackathon DP frames overlay and share it on social media to show your support!",
    url: "https://frostbyte.gdgpup.org",
    type: "website",
    images: [
      {
        url: "/assets/Frostbyte dp blast 1.png",
        width: 1080,
        height: 1080,
        alt: "FROSTBYTE DP Frame",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FROSTBYTE DP Blast | Youth Week Hackathon",
    description: "Customize your profile picture with the official FROSTBYTE: Youth Week Hackathon DP frames overlay and share it on social media!",
    images: ["/assets/Frostbyte dp blast 1.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#060b18] text-[#f1f5f9] selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
