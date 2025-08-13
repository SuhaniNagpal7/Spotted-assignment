import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Wallet - Secure Payout System",
  description: "A secure wallet application for managing payouts and bank transfers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
                                    <Toaster
                          position="top-right"
                          toastOptions={{
                            duration: 4000,
                            style: {
                              background: '#ffffff',
                              color: '#1f2937',
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                              zIndex: 9999,
                              fontWeight: '500',
                            },
                            success: {
                              style: {
                                background: '#ffffff',
                                color: '#065f46',
                                border: '1px solid #10b981',
                              },
                              iconTheme: {
                                primary: '#10b981',
                                secondary: '#ffffff',
                              },
                            },
                            error: {
                              style: {
                                background: '#ffffff',
                                color: '#dc2626',
                                border: '1px solid #ef4444',
                              },
                              iconTheme: {
                                primary: '#ef4444',
                                secondary: '#ffffff',
                              },
                            },
                          }}
                          containerStyle={{
                            zIndex: 9999,
                          }}
                        />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
