"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const profileText = (pathname === "/admin" || pathname === "/superadmin") ? "Admin" : "প্রোফাইল";

  useEffect(() => {
    const checkAdmin = () => {
      const isLogged = localStorage.getItem("isAdminLoggedIn") === "true";
      setIsAdminLoggedIn(isLogged);
      if (isLogged) {
        const savedName = localStorage.getItem("adminUsername");
        setAdminName(savedName || "Admin");
      }
    };
    checkAdmin();
    window.addEventListener("focus", checkAdmin);
    return () => window.removeEventListener("focus", checkAdmin);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminUsername");
    setIsAdminLoggedIn(false);
    setIsAdminDropdownOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-full p-1 shadow flex items-center justify-center flex-shrink-0">
              <img
                src="/hf_logo.png"
                alt="HF সমাজসেবা সংঘ লোগো"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">HF সমাজসেবা সংঘ</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`hover:text-yellow-300 transition-colors font-medium ${pathname === "/" ? "text-yellow-300 font-bold" : ""}`}>
              হোম
            </Link>
            <Link href="/gallery" className={`hover:text-yellow-300 transition-colors font-medium ${pathname === "/gallery" ? "text-yellow-300 font-bold" : ""}`}>
              গ্যালারী
            </Link>
            <Link href="/donate" className={`hover:text-yellow-300 transition-colors font-medium ${pathname === "/donate" ? "text-yellow-300 font-bold" : ""}`}>
              দান করুন
            </Link>
            <Link href="/about" className={`hover:text-yellow-300 transition-colors font-medium ${pathname === "/about" ? "text-yellow-300 font-bold" : ""}`}>
              আমাদের সম্পর্কে
            </Link>

            {/* Admin only header tab with dropdown containing Admin Name and Logout */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/admin?tab=all-donations"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg font-bold text-sm shadow transition-colors flex items-center gap-1.5"
                >
                  📊 দানের হিসাব
                </Link>

                {/* Admin Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold transition-colors shadow flex items-center gap-2 cursor-pointer"
                  >
                    <span>👤 {adminName}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isAdminDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Card */}
                  {isAdminDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/80 rounded-t-xl">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">অ্যাডমিন অ্যাকাউন্ট</p>
                        <p className="text-sm font-bold text-blue-900 truncate mt-0.5">👤 {adminName}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/admin"
                          onClick={() => setIsAdminDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 font-medium transition-colors"
                        >
                          <span>⚙️</span> Admin প্যানেল
                        </Link>
                        <button
                          onClick={() => {
                            setIsAdminDropdownOpen(false);
                            if (pathname === "/admin") {
                              window.dispatchEvent(new CustomEvent("openAdminPasswordModal"));
                            } else {
                              window.location.href = "/admin?openPasswordModal=true";
                            }
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 font-semibold transition-colors text-left cursor-pointer"
                        >
                          <span>🔑</span> পাসওয়ার্ড পরিবর্তন
                        </button>
                      </div>

                      <div className="border-t border-gray-100 pt-1 mt-1">
                        <button
                          onClick={handleAdminLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold transition-colors text-left cursor-pointer"
                        >
                          <span>🚪</span> লগআউট
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link href="/profile" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold transition-colors">
                {profileText}
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white cursor-pointer"
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
            <Link href="/gallery" className="hover:text-yellow-300 transition-colors py-2 border-b border-blue-700">
              গ্যালারী
            </Link>
            <Link href="/donate" className="hover:text-yellow-300 transition-colors py-2 border-b border-blue-700">
              দান করুন
            </Link>
            <Link href="/about" className="hover:text-yellow-300 transition-colors py-2 border-b border-blue-700">
              আমাদের সম্পর্কে
            </Link>
            {isAdminLoggedIn ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-blue-700">
                <div className="bg-blue-950/60 p-3 rounded-xl border border-blue-700/50 mb-1">
                  <p className="text-xs text-yellow-300 font-semibold uppercase">অ্যাডমিন অ্যাকাউন্ট</p>
                  <p className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                    👤 {adminName}
                  </p>
                </div>
                <Link
                  href="/admin?tab=all-donations"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition-colors text-center flex items-center justify-center gap-2"
                >
                  📊 দানের হিসাব
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold transition-colors text-center flex items-center justify-center gap-2"
                >
                  ⚙️ Admin প্যানেল
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (pathname === "/admin") {
                      window.dispatchEvent(new CustomEvent("openAdminPasswordModal"));
                    } else {
                      window.location.href = "/admin?openPasswordModal=true";
                    }
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-full font-bold transition-colors text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  🔑 পাসওয়ার্ড পরিবর্তন
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold transition-colors text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  🚪 লগআউট
                </button>
              </div>
            ) : (
              <Link href="/profile" className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-4 py-2 rounded-full font-bold transition-colors text-center mt-2">
                {profileText}
              </Link>
            )}
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
