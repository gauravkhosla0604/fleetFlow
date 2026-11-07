import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Import the AuthProvider
import { AuthProvider } from "../context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FleetFlow Dashboard",
  description: "Fleet Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Wrap the entire application (children) inside the provider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}