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
    "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/experience", label: "Experience" },
  { href: "/partners", label: "Partners" },
  { href: "/photos", label: "Photos" },
];

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
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <span className="text-white font-bold text-base">CED</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 block leading-tight">
                  Center for Environment
                </span>
                <span className="text-xs text-gray-500">& Development</span>
              </div>
            </Link>
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-lg hover:bg-primary/5 transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-gradient-to-br from-primary-deeper via-primary-dark to-primary-deeper text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur">
                    <span className="text-white font-bold text-base">CED</span>
                  </div>
                  <div>
                    <span className="font-bold text-white block leading-tight">
                      Center for Environment
                    </span>
                    <span className="text-xs text-white/50">
                      & Development
                    </span>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Empowering sustainable futures through expert consultation,
                  innovative solutions, and unwavering commitment to
                  environmental stewardship.
                </p>
                <div className="flex gap-3">
                  {["in", "x", "fb"].map((s) => (
                    <span
                      key={s}
                      className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">
                  Navigation
                </h3>
                <div className="flex flex-col gap-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-white/50 text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">
                  Services
                </h3>
                <div className="flex flex-col gap-3 text-white/50 text-sm">
                  <span>Environmental Impact Assessment</span>
                  <span>Sustainable Development Planning</span>
                  <span>Policy Advisory</span>
                  <span>Climate Risk Assessment</span>
                  <span>Biodiversity Conservation</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">
                  Contact
                </h3>
                <div className="flex flex-col gap-3 text-white/50 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>contact@ced-consult.com</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>123 Green Street, Eco City</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
              <span>&copy; {new Date().getFullYear()} CED. All rights reserved.</span>
              <span>Committed to a sustainable future.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
