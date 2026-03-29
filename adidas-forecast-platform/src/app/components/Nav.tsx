"use client";
import { useState, useEffect } from "react";

const AdidasLogo = ({ inverted = false }: { inverted?: boolean }) => {
  const color = inverted ? "#fff" : "#000";
  return (
    <div className="flex items-center gap-3">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="6" width="7" height="22" rx="1" fill={color} />
        <rect x="10.5" y="0" width="7" height="28" rx="1" fill={color} />
        <rect x="21" y="6" width="7" height="22" rx="1" fill={color} />
      </svg>
      <span
        className="text-2xl font-black tracking-tighter lowercase"
        style={{ color, letterSpacing: "-0.04em" }}
      >
        adidas
      </span>
    </div>
  );
};

const navLinks = [
  { href: "#challenge", label: "Challenge" },
  { href: "#vision", label: "Vision" },
  { href: "#architecture", label: "Architecture" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#kpis", label: "KPIs" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black shadow-lg" : "bg-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <AdidasLogo inverted />
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white text-sm font-semibold tracking-wide hover:text-gray-300 transition-colors uppercase"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="bg-white text-black px-5 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
          >
            Data Eng — LAM
          </a>
        </div>
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white text-sm font-semibold tracking-wide uppercase"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
