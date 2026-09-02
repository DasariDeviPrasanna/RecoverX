import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecoverX - AI Revenue Intelligence",
  description: "AI-powered revenue recovery command center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#08070D] text-white antialiased">
        {children}
      </body>
    </html>
  );
}