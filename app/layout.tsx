import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { AuthProvider } from "./auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={inter.className}>{children}</body>
      </AuthProvider>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Clariti",
  description:
    "",
  metadataBase: new URL("http://localhost:3000"),
};
