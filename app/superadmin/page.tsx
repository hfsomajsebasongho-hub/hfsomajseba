"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-md">
        <div className="text-4xl mb-3 animate-spin">⏳</div>
        <p className="text-gray-700 font-bold text-lg">এডমিন প্যানেলে রিডাইরেক্ট করা হচ্ছে...</p>
      </div>
    </div>
  );
}
