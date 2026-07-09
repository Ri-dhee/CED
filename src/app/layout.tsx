import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import MobileNav from "@/components/MobileNav";
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
  metadataBase: new URL("https://ced-neon.vercel.app"),
  openGraph: {
    title: "CED | Center for Environment & Development",
    description:
      "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
    url: "https://ced-neon.vercel.app",
    siteName: "CED",
    locale: "en_US",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CED | Center for Environment & Development",
    description:
      "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/experts", label: "Experts" },
  {
    label: "Experience",
    children: [
      { href: "/experience", label: "Experience & Projects" },
      { href: "/grme", label: "GRME Index" },
    ],
  },
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
      <head>
        <meta name="theme-color" content="#059669" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Center for Environment & Development",
              alternateName: "CED",
              url: "https://ced-neon.vercel.app",
              logo: "https://ced-neon.vercel.app/logo.png",
              description:
                "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+975-2-324456",
                contactType: "customer service",
                email: "contact@ced-consult.com",
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          Skip to content
        </a>
        <header className="fixed top-0 left-0 right-0 z-50 glass" role="banner">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between" aria-label="Main navigation">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group" aria-label="CED Home">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <span className="text-white font-bold text-sm sm:text-base" aria-hidden="true">CED</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 block leading-tight">
                  Center for Environment
                </span>
                <span className="text-xs text-gray-600">& Development</span>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-1" role="menubar">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative group">
                    <button
                      role="menuitem"
                      aria-haspopup="true"
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-lg hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-primary/5 flex items-center gap-1"
                    >
                      {link.label}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[160px]">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            role="menuitem"
                            className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-primary/5"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-lg hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-primary/5"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
            <MobileNav />
          </nav>
        </header>
        <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
        <footer className="bg-primary-dark text-white" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/70">
              <span>&copy; {new Date().getFullYear()} CED — Center for Environment & Development</span>
              <a href="mailto:contact@ced-consult.com" className="hover:text-white transition-colors">contact@ced-consult.com</a>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
