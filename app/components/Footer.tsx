import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 text-white relative shadow-2xl">
      {/* Top Bright Gold Accent Line */}
      <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 shadow-md"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white tracking-wide">HF সমাজসেবা সংঘ</h3>
              </div>
            </div>
            <p className="text-gray-100 text-base mb-6 leading-relaxed font-normal">
              আমরা সমাজের অসহায় ও দুঃস্থ মানুষদের পাশে দাঁড়াতে প্রতিশ্রুতিবদ্ধ। 
              আপনার সামান্য সাহায্যে একটি পরিবারের মুখে হাসি ফোটাতে পারি।
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-11 h-11 bg-slate-800 hover:bg-yellow-400 hover:text-gray-950 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110 border border-slate-700 text-lg">
                <span>📘</span>
              </a>
              <a href="#" className="w-11 h-11 bg-slate-800 hover:bg-yellow-400 hover:text-gray-950 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110 border border-slate-700 text-lg">
                <span>📷</span>
              </a>
              <a href="#" className="w-11 h-11 bg-slate-800 hover:bg-yellow-400 hover:text-gray-950 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110 border border-slate-700 text-lg">
                <span>🐦</span>
              </a>
              <a href="#" className="w-11 h-11 bg-slate-800 hover:bg-yellow-400 hover:text-gray-950 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110 border border-slate-700 text-lg">
                <span>📺</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-extrabold mb-4 text-yellow-300 border-b-2 border-yellow-400/40 pb-2 inline-block tracking-wide">
              দ্রুত লিংক
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-white hover:text-yellow-300 transition-colors font-semibold text-base flex items-center gap-2 group">
                  <span className="text-yellow-400 font-bold group-hover:translate-x-1 transition-transform">›</span> 
                  <span>হোম</span>
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-white hover:text-yellow-300 transition-colors font-semibold text-base flex items-center gap-2 group">
                  <span className="text-yellow-400 font-bold group-hover:translate-x-1 transition-transform">›</span> 
                  <span>ডোনেট করুন</span>
                </Link>
              </li>
              <li>
                <Link href="/donors" className="text-white hover:text-yellow-300 transition-colors font-semibold text-base flex items-center gap-2 group">
                  <span className="text-yellow-400 font-bold group-hover:translate-x-1 transition-transform">›</span> 
                  <span>ডোনারদের তালিকা</span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-yellow-300 transition-colors font-semibold text-base flex items-center gap-2 group">
                  <span className="text-yellow-400 font-bold group-hover:translate-x-1 transition-transform">›</span> 
                  <span>আমাদের সম্পর্কে</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-extrabold mb-4 text-yellow-300 border-b-2 border-yellow-400/40 pb-2 inline-block tracking-wide">
              যোগাযোগ
            </h4>
            <ul className="space-y-3 text-white font-medium text-base">
              <li className="flex items-center gap-3">
                <span className="text-yellow-300 text-lg">📍</span>
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-yellow-300 text-lg">📞</span>
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-yellow-300 text-lg">📧</span>
                <span>info@hilfulfuzul.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-700/80 mt-10 pt-6 text-center text-gray-200 font-medium text-sm">
          <p>© ২০২৬ হিলফুল ফুজুল সমাজসেবা সংঘ। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
}
