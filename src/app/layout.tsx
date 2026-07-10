import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import MobileNav from "@/components/MobileNav";
import "./globals.css";
import logoCed from "../../logo_ced.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CED | Center for Environment & Development",
    template: "%s | CED",
  },
  description:
    "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
  metadataBase: new URL("https://cedbhutan.com"),
  openGraph: {
    title: "CED | Center for Environment & Development",
    description:
      "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
    url: "https://cedbhutan.com",
    siteName: "CED",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CED | Center for Environment & Development",
    description:
      "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
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
              url: "https://cedbhutan.com",
              logo: "https://cedbhutan.com/logo-ced",
              description:
                "Premier private consultation firm specializing in environmental management, sustainable development, and policy advisory.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+975-2-324456",
                contactType: "customer service",
                email: "ced.bhutan@gmail.com",
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
              <Image
                src={logoCed}
                alt="CED logo"
                width={52}
                height={52}
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0"
              />
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
        <footer className="bg-gradient-to-br from-primary-deeper via-primary-dark to-primary-deeper text-white" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src={logoCed}
                    alt="CED logo"
                    width={52}
                    height={52}
                    className="h-10 w-10 sm:h-12 sm:w-12 object-contain shrink-0"
                  />
                  <div>
                    <span className="font-bold text-white block leading-tight">Centre for Environment</span>
                    <span className="text-xs text-white/60 block">& Development</span>
                    <span className="text-xs text-white/50 block">Research and Consultancy Services</span>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Research and consultancy services in environmental management and sustainable development.
                </p>
                <ul className="flex gap-3 list-none p-0 m-0" aria-label="Social media links">
                  {[
                    { label: "Website", href: "https://www.cedbhutan.com" },
                    { label: "Email", href: "mailto:ced.bhutan@gmail.com" },
                    { label: "Map", href: "https://www.google.com/search?q=Chhagoedhing%2C+Dolaygang+Road%2C+Simtokha+E4+zone%2C+Thimphu+Thromde%2C+Bhutan" },
                  ].map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/60 text-xs font-bold hover:bg-white/20 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label={social.label}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {social.label === "Website" ? "W" : social.label === "Email" ? "E" : "M"}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">Navigation</h3>
                <nav aria-label="Footer navigation">
                  <div className="flex flex-col gap-3">
                    {navLinks.map((link) =>
                      link.children ? (
                        link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="text-white/70 text-sm hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light focus:text-white rounded px-1 -mx-1"
                          >
                            {child.label}
                          </Link>
                        ))
                      ) : (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="text-white/70 text-sm hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light focus:text-white rounded px-1 -mx-1"
                        >
                          {link.label}
                        </Link>
                      )
                    )}
                  </div>
                </nav>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">Services</h3>
                <ul className="flex flex-col gap-3 text-white/70 text-sm list-none p-0">
                  <li>Environmental Impact Assessment</li>
                  <li>Sustainable Development Planning</li>
                  <li>Policy Advisory</li>
                  <li>Climate Risk Assessment</li>
                  <li>Biodiversity Conservation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-6 text-sm uppercase tracking-wider">Contact</h3>
                <div className="flex flex-col gap-3 text-white/70 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:ced.bhutan@gmail.com" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light rounded">ced.bhutan@gmail.com</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href="https://www.cedbhutan.com" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light rounded">www.cedbhutan.com</a>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 mt-0.5 text-primary-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Chhagoedhing, Dolaygang Road, Simtokha E4 zone, Thimphu Thromde, Bhutan</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
              <span>&copy; {new Date().getFullYear()} Centre for Environment and Development</span>
              <span>Research and Consultancy Services</span>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
