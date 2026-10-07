import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoActe — Înmatriculează inteligent",
  description:
    "Prototip pentru înmatricularea vehiculelor în România: modelează pașii de la DGPCI, RAR, ANAF, DGITL și asigurători într-un singur flux digital.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "AutoActe — Digital Romania",
    description:
      "Înmatricularea auto într-un singur flux digital, cu OCR Claude Vision, termene legale și calculator de costuri.",
    type: "website",
    locale: "ro_RO",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-(--color-background) text-(--color-foreground)">
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton theme="light" />
        </Providers>
      </body>
    </html>
  );
}
