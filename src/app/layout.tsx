import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/providers/SessionProvider";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Daily Mate - Günlük Yevmiye Takip",
  description: "Günlük yevmiye ve çalışma saatlerinizi kolayca takip edin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${urbanist.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
