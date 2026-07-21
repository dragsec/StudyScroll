import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Sora } from "next/font/google";
import { AppLaunchSplash } from "@/components/AppLaunchSplash";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudyScroll: Learn by scrolling",
  description: "Train your judgment with quick technical challenges.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#121318",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fonts = sora.variable + " " + plexSans.variable + " " + plexMono.variable;
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={fonts}>
        <AppLaunchSplash />
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
