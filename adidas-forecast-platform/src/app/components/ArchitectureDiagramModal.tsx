"use client";

import { useState, useEffect, useCallback } from "react";

const DIAGRAMS = [
  {
    id: "a",
    tab: "End-to-End",
    label: "Diagram A — End-to-End Architecture",
    src: "/diagram-a-rough.svg",
    description: "Full platform from source systems to user experience modules",
  },
  {
    id: "d",
    tab: "ML Pipeline",
    label: "Diagram D — ML Pipeline",
    src: "/diagram-d-rough.svg",
    description: "Champion / Challenger model training, registry and serving",
  },
  {
    id: "f",
    tab: "Governance",
    label: "Diagram F — Governance & Compliance",
    src: "/diagram-f-rough.svg",
    description: "Unity Catalog · RBAC · Lineage · LAM regulatory compliance",
  },
];

export default function ArchitectureDiagramModal() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Close on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    },
    []
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  return (
    <>
      {/* ── Clickable banner thumbnail ──────────────────────────────────────── */}
      <div className="mt-10">
        <button
          onClick={() => setOpen(true)}
          className="w-full group relative overflow-hidden border border-gray-200 bg-white hover:border-black transition-colors duration-200 focus:outline-none"
          aria-label="Open full architecture diagram"
        >
          {/* SVG thumbnail */}
          <div className="w-full overflow-hidden" style={{ maxHeight: "220px" }}>
            <img
              src={DIAGRAMS[0].src}
              alt="Architecture diagram preview"
              className="w-full h-auto object-cover object-top pointer-events-none"
              style={{ marginBottom: "-20px" }}
            />
          </div>

          {/* Gradient overlay + CTA */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white group-hover:to-gray-50 transition-colors duration-200" />
          <div className="absolute bottom-0 inset-x-0 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Three-stripe icon */}
              <div className="flex gap-0.5">
                <div className="w-1 h-5 bg-black" />
                <div className="w-1 h-5 bg-black" />
                <div className="w-1 h-5 bg-black" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-black">
                  View Full Architecture
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  3 diagrams — End-to-End · ML Pipeline · Governance
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black group-hover:gap-3 transition-all duration-150">
              Open
              <span className="text-base">→</span>
            </div>
          </div>
        </button>
      </div>

      {/* ── Modal / Lightbox ────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="relative bg-white flex flex-col"
            style={{
              width: "min(95vw, 1400px)",
              maxHeight: "92vh",
              borderRadius: "2px",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  <div className="w-1 h-4 bg-black" />
                  <div className="w-1 h-4 bg-black" />
                  <div className="w-1 h-4 bg-black" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">
                  Architecture Diagrams
                </span>
                <span className="text-xs text-gray-400 hidden md:inline">
                  — Demand Forecasting Platform · adidas LAM
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-xs font-black uppercase tracking-widest px-3 py-1.5 border border-transparent hover:border-black transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 flex-shrink-0">
              {DIAGRAMS.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setActive(i)}
                  className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 ${
                    active === i
                      ? "border-black text-black bg-white"
                      : "border-transparent text-gray-400 hover:text-black"
                  }`}
                >
                  {d.tab}
                </button>
              ))}
              <div className="ml-auto flex items-center px-6">
                <span className="text-xs text-gray-400">
                  {DIAGRAMS[active].description}
                </span>
              </div>
            </div>

            {/* Diagram area — scrollable */}
            <div
              className="flex-1 overflow-auto bg-gray-50"
              style={{ minHeight: 0 }}
            >
              <div className="p-4 md:p-8 min-w-0">
                <img
                  key={DIAGRAMS[active].src}
                  src={DIAGRAMS[active].src}
                  alt={DIAGRAMS[active].label}
                  className="w-full h-auto block"
                  style={{ minWidth: "860px" }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-gray-400 font-mono">
                {DIAGRAMS[active].label}
              </span>
              <div className="flex gap-2">
                {DIAGRAMS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      active === i ? "bg-black" : "bg-gray-300"
                    }`}
                    aria-label={`Go to diagram ${i + 1}`}
                  />
                ))}
              </div>
              <a
                href={DIAGRAMS[active].src}
                download
                className="text-xs font-bold uppercase tracking-widest hover:underline"
              >
                ↓ Download SVG
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
