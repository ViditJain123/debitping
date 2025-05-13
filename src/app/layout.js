import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import LoadingProvider from '../components/LoadingProvider'



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "DebitPing - Automate WhatsApp Payment Reminders",
  description: "Connect your accounting tools and let WhatsApp follow up on your overdue payments automatically. Never chase payments again.",
  keywords: ["whatsapp automation", "payment reminders", "invoice reminders", "accounting automation"],
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Suspense fallback={<div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gray-200 dark:bg-gray-800">
            <div className="h-full bg-gradient-to-r from-primary to-secondary animate-loading-bar"></div>
          </div>}>
            <LoadingProvider>
              {children}
            </LoadingProvider>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
