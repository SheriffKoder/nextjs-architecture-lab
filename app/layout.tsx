import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ReduxProvider } from "@/features/auth/store/ReduxProvider";
import DevelopmentToggle from "@/components/development-toggle/development-toggle";
import { SessionRestorer } from "@/features/auth/session/components/session-restorer";
import { RolesLoader } from "@/features/auth/roles/components/roles-loader";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Revilo Group Investment Management",
  description: "Portfolio management and financial reporting system for real estate investments, investor allocations, and project tracking",
  keywords: ["real estate", "investment management", "portfolio", "financial reporting", "revilo group"],
  authors: [{ name: "Revilo Group" }],
  creator: "Revilo Group",
  applicationName: "Revilo Investment Web App",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ReduxProvider>
          <SessionRestorer />
          <RolesLoader />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            {/* <DevelopmentToggle /> */}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
