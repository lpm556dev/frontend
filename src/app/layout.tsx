import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HydrationHandler from "../components/HydrationHandler";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Santri Siap Guna",
  description: "Website LPM SSG Yang Santri Yang Siap Guna",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-center"/>
        <HydrationHandler>
          {children}
        </HydrationHandler>
      </body>
    </html>
  );
}