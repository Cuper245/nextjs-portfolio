// app/layout.tsx
import "../global.css";
import { Inter } from "@next/font/google";
import LocalFont from "@next/font/local";
import { Metadata } from "next";
import { Analytics } from "./components/analytics";

// Build a safe site URL for both local and Vercel
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL // set by you (local/prod)
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),   // <-- no placeholders
  title: { default: "Valentina Gonzalez — Robotics Portfolio", template: "%s | Valentina Gonzalez" },
  description: "Robotics • Embedded Systems • Control — projects, write-ups, and videos.",
  openGraph: {
    title: "Valentina Gonzalez — Robotics Portfolio",
    description: "Robotics • Embedded Systems • Control — projects, write-ups, and videos.",
    url: siteUrl,
    siteName: "Valentina Gonzalez — Portfolio",
    images: [{ url: "/og.jpg", width: 1920, height: 1080 }],
    locale: "en-US",
    type: "website",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  twitter: { title: "Valentina Gonzalez — Robotics", card: "summary_large_image" },
  icons: { shortcut: "/favicon.png" },
};

const InterFont = Inter({ subsets: ["latin"], variable: "--font-inter" });
const CalSans = LocalFont({ src: "../public/fonts/CalSans-SemiBold.ttf", variable: "--font-calsans" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={[InterFont.variable, CalSans.variable].join(" ")}>
      <head><Analytics /></head>
      <body className={`bg-black ${process.env.NODE_ENV === "development" ? "debug-screens" : undefined}`}>{children}</body>
    </html>
  );
}
