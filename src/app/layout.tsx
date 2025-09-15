import type { Metadata } from "next";
import Nav from "./Nav";
import SwRegister from "./SwRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoice maker",
  description: "Jednostavna izrada faktura (lokalno spremanje, EUR, PDF)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <body className={`antialiased`}>
        <div className="nav">
          <div className="max-w-5xl mx-auto">
            <Nav />
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          {children}
          <SwRegister />
        </div>
        <footer className="mt-10">
          <div className="max-w-5xl mx-auto text-center text-sm text-[var(--subtle)] py-6 border-t border-white/10">By Almin Hasic</div>
        </footer>
      </body>
    </html>
  );
}
