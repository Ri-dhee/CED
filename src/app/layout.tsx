import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
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
  metadataBase: new URL("https://ced-consult.vercel.app"),
  openGraph: {
    title: "CED | Center for Environment & Development",
    description:
      "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
    url: "https://ced-consult.vercel.app",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Center for Environment & Development",
              alternateName: "CED",
              url: "https://ced-consult.vercel.app",
              logo: "https://ced-consult.vercel.app/logo.png",
              description:
                "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+1-555-123-4567",
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
          <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between" aria-label="Main navigation">
            <Link href="/" className="flex items-center gap-3 group" aria-label="CED Home">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <span className="text-white font-bold text-base" aria-hidden="true">CED</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900 block leading-tight">
                  Center for Environment
                </span>
                <span className="text-xs text-gray-500">& Development</span>
              </div>
            </Link>
            <div className="flex items-center gap-1" role="menubar">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-lg hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-primary/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
        <footer className="bg-gradient-to-br from-primary-deeper via-primary-dark to-primary-deeper text-white" role="contentinfo">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur">
                    <span className="text-white font-bold text-base" aria-hidden="true">CED</span>
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
                <div className="flex gap-3" role="list" aria-label="Social media links">
                  {["in", "x", "fb"].map((s) => (
                    <span
                      key={s}
                      role="listitem"
                      className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 text-xs font-bold hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                      aria-label={`${s} social link`}
                      tabIndex={0}
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
                <nav aria-label="Footer navigation">
                  <div className="flex flex-col gap-3">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-white/50 text-sm hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light focus:text-white rounded px-1 -mx-1"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </nav>
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
                    <svg className="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:contact@ced-consult.com" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light rounded">contact@ced-consult.com</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href="tel:+15551234567" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light rounded">+1 (555) 123-4567</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
        <Analytics />
      </body>
    </html>
  );
}
