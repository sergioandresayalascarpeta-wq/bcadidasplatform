"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const AdidasMark = () => (
  <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
    <rect x="0" y="6" width="7" height="22" rx="1" fill="white" />
    <rect x="10.5" y="0" width="7" height="28" rx="1" fill="white" />
    <rect x="21" y="6" width="7" height="22" rx="1" fill="white" />
  </svg>
);

const navItems = [
  {
    href: "/platform/mlops",
    label: "MLOps Studio",
    short: "MLOps",
    number: "01",
    dot: "bg-blue-500",
  },
  {
    href: "/platform/scenario",
    label: "Scenario Planner",
    short: "Scenarios",
    number: "02",
    dot: "bg-emerald-500",
  },
  {
    href: "/platform/executive",
    label: "Executive Dashboard",
    short: "Executive",
    number: "03",
    dot: "bg-amber-500",
  },
];

export default function PlatformNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/platform" className="flex items-center gap-2 flex-shrink-0">
          <AdidasMark />
          <span
            className="text-white text-base font-black tracking-tighter lowercase hidden sm:block"
            style={{ letterSpacing: "-0.04em" }}
          >
            adidas
          </span>
          <span className="text-gray-600 text-xs uppercase tracking-widest hidden md:block">
            / Platform
          </span>
        </Link>

        {/* Module tabs */}
        <div className="flex items-center gap-px">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? "bg-white text-black"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.dot}`} />
                <span className="hidden lg:inline">{item.label}</span>
                <span className="lg:hidden">{item.short}</span>
              </Link>
            );
          })}
        </div>

        {/* Exit */}
        <Link
          href="/"
          className="text-xs text-gray-600 hover:text-gray-300 uppercase tracking-wider flex-shrink-0 flex items-center gap-1 transition-colors"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2L2 6l6 4" />
          </svg>
          <span className="hidden sm:inline">Exit</span>
        </Link>
      </div>
    </nav>
  );
}
