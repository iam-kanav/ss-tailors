"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroSlidePair {
  left: {
    name: string;
    slug: string;
    imageUrl: string;
  };
  right: {
    name: string;
    slug: string;
    imageUrl: string;
  };
}

const HERO_PAIRS: HeroSlidePair[] = [
  {
    left: {
      name: "Crimson Brocade-Hem Chuba",
      slug: "potala-crimson-brocade-chuba",
      imageUrl: "/images/products/potala-crimson-chuba.jpg",
    },
    right: {
      name: "Indigo & Gold Silk Losar Chuba",
      slug: "imperial-indigo-kinkhab-losar-chuba",
      imageUrl: "/images/products/imperial-indigo-losar-chuba.jpg",
    },
  },
  {
    left: {
      name: "Camel Wool Chuba with Shearling Trim",
      slug: "lhasa-ochre-pulu-wool-chuba",
      imageUrl: "/images/products/lhasa-camel-wool-chuba.jpg",
    },
    right: {
      name: "Handwoven Striped Pangden Apron",
      slug: "handwoven-heritage-striped-pangden",
      imageUrl: "/images/products/handwoven-rainbow-pangden.jpg",
    },
  },
  {
    left: {
      name: "Black & Gold Men's Chuba (Phogoe)",
      slug: "kham-obsidian-gold-mens-chuba",
      imageUrl: "/images/products/kham-obsidian-mens-chuba.jpg",
    },
    right: {
      name: "Black Lotus Brocade Jacket (Toethung)",
      slug: "lotus-silk-brocade-toethung-jacket",
      imageUrl: "/images/products/lotus-brocade-toethung-jacket.jpg",
    },
  },
  {
    left: {
      name: "Light Blue Silk Wonju Blouse",
      slug: "glacial-aqua-mulberry-silk-wonju",
      imageUrl: "/images/products/glacial-aqua-silk-wonju.jpg",
    },
    right: {
      name: "Maroon Wool Men's Chuba",
      slug: "amdo-maroon-wool-mens-chuba",
      imageUrl: "/images/products/amdo-maroon-mens-chuba.jpg",
    },
  },
];

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_PAIRS.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [paused]);

  const currentPair = HERO_PAIRS[activeIndex];

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 sm:pt-7">
      <div
        className="grid grid-cols-1 lg:grid-cols-12 border border-[#e5e5e5] bg-white overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left Warm-Stone Copy Panel (Option 1 exact palette) */}
        <div className="lg:col-span-5 bg-[#f5f4f0] px-7 py-10 sm:px-10 sm:py-14 lg:px-12 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.12] text-[#111111]">
            Authentic Tibetan Clothing
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#52504c] max-w-md">
            We have been making and selling authentic Tibetan clothing in Majnu Ka Tila, Delhi —
            Chubas, Pangdens, Wonjus, jackets, and custom-stitched wear.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="#shop"
              className="px-6 py-3 bg-[#111111] hover:bg-[#333333] text-white text-sm font-medium transition-colors"
            >
              Shop Collection
            </Link>
            <Link
              href="#custom-tailoring"
              className="px-6 py-3 bg-transparent hover:border-[#111111] text-[#111111] border border-[#cccccc] text-sm font-medium transition-colors"
            >
              Custom Fitting
            </Link>
          </div>

          {/* Subtle slide selector bars */}
          <div className="mt-10 flex items-center gap-2" aria-label="Featured garments">
            {HERO_PAIRS.map((pair, idx) => (
              <button
                key={pair.left.slug}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Show ${pair.left.name} and ${pair.right.name}`}
                aria-current={idx === activeIndex ? "true" : undefined}
                className={`h-0.5 transition-all duration-300 cursor-pointer ${
                  idx === activeIndex ? "w-8 bg-[#111111]" : "w-4 bg-[#cfcdc7] hover:bg-[#888580]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right 2-Column Animated Studio Garment Showcase */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-[2px] bg-white">
          {/* Left Garment Slot */}
          <Link
            href={`/products/${currentPair.left.slug}`}
            className="group relative aspect-[3/4] sm:aspect-auto sm:h-[460px] lg:h-[520px] bg-[#f5f5f3] overflow-hidden block"
          >
            {HERO_PAIRS.map((pair, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={pair.left.slug}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-all duration-700 ease-out ${
                    isActive
                      ? "opacity-100 scale-100 z-10"
                      : "opacity-0 scale-[1.03] z-0 pointer-events-none"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pair.left.imageUrl}
                    alt={pair.left.name}
                    className="w-full h-full object-contain object-center bg-[#f5f5f3] transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              );
            })}
            <span className="absolute bottom-3 left-3 z-20 bg-white/90 px-2.5 py-1 text-xs text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {currentPair.left.name}
            </span>
          </Link>

          {/* Right Garment Slot (subtle 180ms staggered crossfade) */}
          <Link
            href={`/products/${currentPair.right.slug}`}
            className="group relative aspect-[3/4] sm:aspect-auto sm:h-[460px] lg:h-[520px] bg-[#f5f5f3] overflow-hidden block"
          >
            {HERO_PAIRS.map((pair, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={pair.right.slug}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-all duration-700 delay-150 ease-out ${
                    isActive
                      ? "opacity-100 scale-100 z-10"
                      : "opacity-0 scale-[1.03] z-0 pointer-events-none"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pair.right.imageUrl}
                    alt={pair.right.name}
                    className="w-full h-full object-contain object-center bg-[#f5f5f3] transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              );
            })}
            <span className="absolute bottom-3 left-3 z-20 bg-white/90 px-2.5 py-1 text-xs text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {currentPair.right.name}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
