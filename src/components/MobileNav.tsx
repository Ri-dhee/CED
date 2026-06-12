"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  {
    label: "Experience",
    children: [
      { href: "/experience", label: "Experience" },
      { href: "/grme", label: "GRME Index" },
    ],
  },
  { href: "/partners", label: "Partners" },
  { href: "/photos", label: "Photos" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${open ? "rotate-45 translate-y-[1px]" : "-translate-y-1"}`} />
        <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 absolute ${open ? "opacity-0" : "opacity-100"}`} />
        <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${open ? "-rotate-45 -translate-y-[1px]" : "translate-y-1"}`} />
      </button>

      <div
        className={`fixed inset-0 top-20 bg-white/95 backdrop-blur-xl z-40 transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-2 -mt-20">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="w-full text-center">
                <button
                  onClick={() => setExpandedGroup(expandedGroup === link.label ? null : link.label)}
                  className="text-2xl font-semibold px-8 py-4 rounded-xl transition-all text-gray-600 hover:text-primary hover:bg-primary/5 flex items-center justify-center gap-2 mx-auto"
                  aria-expanded={expandedGroup === link.label}
                >
                  {link.label}
                  <svg
                    className={`w-4 h-4 transition-transform ${expandedGroup === link.label ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedGroup === link.label && (
                  <div className="flex flex-col gap-1 mt-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`text-xl font-medium px-8 py-3 rounded-xl transition-all ${
                          pathname === child.href
                            ? "text-primary bg-primary/5"
                            : "text-gray-500 hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-2xl font-semibold px-8 py-4 rounded-xl transition-all ${
                  pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-gray-600 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@ced-consult.com&subject=CED%20Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg"
          >
            Contact Us
          </a>
        </nav>
      </div>
    </div>
  );
}
