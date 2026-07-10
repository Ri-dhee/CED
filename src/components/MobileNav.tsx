"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeNav = useCallback(() => {
    setOpen(false);
    setExpandedGroup(null);
    hamburgerRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeNav();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeNav]);

  useEffect(() => {
    if (open && panelRef.current) {
      const firstLink = panelRef.current.querySelector<HTMLElement>(
        'a[href], button'
      );
      firstLink?.focus();
    }
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={hamburgerRef}
        onClick={() => (open ? closeNav() : setOpen(true))}
        className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
      >
        <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${open ? "rotate-45 translate-y-[1px]" : "-translate-y-1"}`} />
        <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 absolute ${open ? "opacity-0" : "opacity-100"}`} />
        <span className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${open ? "-rotate-45 -translate-y-[1px]" : "translate-y-1"}`} />
      </button>

      <div
        ref={panelRef}
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed inset-0 top-20 bg-white/95 backdrop-blur-xl z-40 transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <nav aria-label="Mobile navigation" className="flex flex-col items-center justify-center h-full gap-2 -mt-20">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="w-full text-center">
                <button
                  onClick={() => setExpandedGroup(expandedGroup === link.label ? null : link.label)}
                  className="text-2xl font-semibold px-8 py-4 rounded-xl transition-all text-gray-700 hover:text-primary hover:bg-primary/5 flex items-center justify-center gap-2 mx-auto focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <div role="group" aria-label={`${link.label} submenu`} className="flex flex-col gap-1 mt-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeNav}
                        className={`text-xl font-medium px-8 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                          pathname === child.href
                            ? "text-primary bg-primary/5"
                            : "text-gray-600 hover:text-primary hover:bg-primary/5"
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
                onClick={closeNav}
                className={`text-2xl font-semibold px-8 py-4 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                  pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-gray-700 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=ced.bhutan@gmail.com&subject=CED%20Inquiry"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeNav}
            className="mt-6 inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Contact Us
          </a>
        </nav>
      </div>
    </div>
  );
}
