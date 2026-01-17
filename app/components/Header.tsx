"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🤝</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">হিলফুল ফুজুল</h1>
              <p className="text-xs text-blue-200">সমাজসেবা সংঘ</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-yellow-300 transition-colors font-medium">
              হোম
            </Link>
            <Link href="/donate" className="hover:text-yellow-300 transition-colors font-medium">
              দান করুন
            </Link>
            <Link href="/donors" className="hover:text-yellow-300 transition-colors font-medium">
              দাতাদের তালিকা
            </Link>
            <Link href="/about" className="hover:text-yellow-300 transition-colors font-medium">
              আমাদের সম্পর্কে
            </Link>
            <Link href="/profile" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold transition-colors">
              প্রোফাইল
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-3">
            <Link href="/" className="hover:text-yellow-300 transition-colors py-2 border-b border-blue-700">
              হোম
            </Link>
            <Link href="/donate" className="hover:text-yellow-300 transition-colors py-2 border-b border-blue-700">
              দান করুন
            </Link>
            <Link href="/donors" className="hover:text-yellow-300 transition-colors py-2 border-b border-blue-700">
              দাতাদের তালিকা
            </Link>
            <Link href="/about" className="hover:text-yellow-300 transition-colors py-2 border-b border-blue-700">
              আমাদের সম্পর্কে
            </Link>
            <Link href="/profile" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold transition-colors text-center mt-2">
              প্রোফাইল
            </Link>
          </nav>
        )}
      </div>
      
      {/* Scrolling Marquee Text */}
      <div className="bg-yellow-500 text-blue-900 py-2 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-8 font-bold text-lg">🤲 আসুন আমরা সবাই মিলে দানের হাত বাড়িয়ে দেই, মানবতার সেবায় নিজেকে আত্মনিয়োগ করি 💚</span>
          <span className="mx-8 font-bold text-lg">🤲 আসুন আমরা সবাই মিলে দানের হাত বাড়িয়ে দেই, মানবতার সেবায় নিজেকে আত্মনিয়োগ করি 💚</span>
          <span className="mx-8 font-bold text-lg">🤲 আসুন আমরা সবাই মিলে দানের হাত বাড়িয়ে দেই, মানবতার সেবায় নিজেকে আত্মনিয়োগ করি 💚</span>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </header>
  );
}
