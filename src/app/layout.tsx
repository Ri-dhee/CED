import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CED | Center for Environment & Development",
  description:
    "Private consultation firm specializing in environment and development solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
          <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CED</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:block">
                Center for Environment & Development
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <Link
                href="/experience"
                className="hover:text-primary transition-colors"
              >
                Experience
              </Link>
              <Link
                href="/partners"
                className="hover:text-primary transition-colors"
              >
                Partners
              </Link>
              <Link
                href="/photos"
                className="hover:text-primary transition-colors"
              >
                Photos
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-primary-dark text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CED</span>
                  </div>
                  <span className="font-semibold">
                    Center for Environment & Development
                  </span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Private consultation firm committed to sustainable
                  environment and development solutions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <div className="flex flex-col gap-2 text-sm text-white/70">
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                  <Link
                    href="/experience"
                    className="hover:text-white transition-colors"
                  >
                    Experience
                  </Link>
                  <Link
                    href="/partners"
                    className="hover:text-white transition-colors"
                  >
                    Partners
                  </Link>
                  <Link
                    href="/photos"
                    className="hover:text-white transition-colors"
                  >
                    Photos
                  </Link>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <div className="flex flex-col gap-2 text-sm text-white/70">
                  <span>contact@ced-consult.com</span>
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
              &copy; {new Date().getFullYear()} CED. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
