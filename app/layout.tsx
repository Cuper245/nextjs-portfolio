import "../global.css";
import { Inter } from "@next/font/google";
import LocalFont from "@next/font/local";
import { Metadata } from "next";
import { Analytics } from "./components/analytics";

export const metadata: Metadata = {
  // 👇 NEW: helps Next resolve absolute URLs during build (OG/Twitter images)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://<your-vercel-project>.vercel.app"),

  title: {
    default: "Martha Pérez — Robotics Portfolio",
    template: "%s | Martha Pérez",
  },
  description: "Robotics • Embedded Systems • Control — projects, write-ups, and videos.",
  openGraph: {
    title: "Martha Pérez — Robotics Portfolio",
    description: "Robotics • Embedded Systems • Control — projects, write-ups, and videos.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://<your-vercel-project>.vercel.app",
    siteName: "Martha Pérez — Portfolio",
    images: [
      {
        // You can keep an external URL, but a local OG is faster & stable:
        url: "/og.jpg",
        width: 1920,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: "Martha Pérez — Robotics",
    card: "summary_large_image",
  },
  icons: {
    shortcut: "/favicon.png",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const calSans = LocalFont({
  src: "../public/fonts/CalSans-SemiBold.ttf",
  variable: "--font-calsans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={[inter.variable, calSans.variable].join(" ")}>
      <head>
        <Analytics />
      </head>
      <body
        className={`bg-black ${process.env.NODE_ENV === "development" ? "debug-screens" : undefined}`}
      >
        {children}
      </body>
    </html>
  );
}
