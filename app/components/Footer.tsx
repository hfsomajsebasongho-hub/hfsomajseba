import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">হিলফুল ফুজুল সমাজসেবা সংঘ</h3>
              </div>
            </div>
            <p className="text-blue-200 mb-4">
              আমরা সমাজের অসহায় ও দুঃস্থ মানুষদের পাশে দাঁড়াতে প্রতিশ্রুতিবদ্ধ। 
              আপনার সামান্য সাহায্যে একটি পরিবারের মুখে হাসি ফোটাতে পারি।
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <span>📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <span>📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <span>🐦</span>
              </a>
              <a href="#" className="w-10 h-10 bg-blue-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <span>📺</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-yellow-400">দ্রুত লিংক</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-blue-200 hover:text-white transition-colors">
                  হোম
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-blue-200 hover:text-white transition-colors">
                  ডোনেট করুন
                </Link>
              </li>
              <li>
                <Link href="/donors" className="text-blue-200 hover:text-white transition-colors">
                  ডোনারদের তালিকা
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-blue-200 hover:text-white transition-colors">
                  আমাদের সম্পর্কে
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-yellow-400">যোগাযোগ</h4>
            <ul className="space-y-3 text-blue-200">
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+880 1XXX-XXXXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>info@hilfulfuzul.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-300">
          <p>© ২০২৬ হিলফুল ফুজুল সমাজসেবা সংঘ। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </div>
    </footer>
  );
}
