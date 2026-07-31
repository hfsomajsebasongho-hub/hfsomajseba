"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { subscribeAllUsers, subscribeCustomLedger } from "@/lib/dbSync";

interface Donor {
  name: string;
  amount: number;
  date: string;
  isAnonymous?: boolean;
}

export default function Home() {
  const [recentDonors, setRecentDonors] = useState<Donor[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  const [allUsersData, setAllUsersData] = useState<any[]>([]);
  const [customEntriesData, setCustomEntriesData] = useState<any[]>([]);

  useEffect(() => {
    const unsubUsers = subscribeAllUsers((users) => {
      setAllUsersData(users);
    });
    const unsubCustom = subscribeCustomLedger((entries) => {
      setCustomEntriesData(entries);
    });
    return () => {
      unsubUsers();
      unsubCustom();
    };
  }, []);

  useEffect(() => {
    let donations: Donor[] = [];
    let totalDonationAmount = 0;
    let donorCountSet = new Set<string>();

    allUsersData.forEach((u: any) => {
      if (u.donations && Array.isArray(u.donations)) {
        const approved = u.donations.filter((d: any) => d.status === "approved" || !d.status);
        approved.forEach((d: any) => {
          donations.push({
            name: u.name || "দাতা",
            amount: Number(d.amount) || 0,
            date: d.date || "",
            isAnonymous: u.name === "বেনামী",
          });
          totalDonationAmount += Number(d.amount) || 0;
          donorCountSet.add(u.phone || u.name);
        });
      }
    });

    customEntriesData.forEach((ce: any) => {
      if (ce.type === "income" || (ce.incomeAmount && ce.incomeAmount > 0)) {
        donations.push({
          name: ce.donorName || "দাতা",
          amount: Number(ce.incomeAmount) || 0,
          date: ce.date || "",
          isAnonymous: ce.donorName === "বেনামী",
        });
        totalDonationAmount += Number(ce.incomeAmount) || 0;
        donorCountSet.add(ce.phone || ce.donorName);
      }
    });

    donations.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    setRecentDonors(donations.slice(0, 10));
    setTotalAmount(totalDonationAmount);
    setTotalDonors(donorCountSet.size);
  }, [allUsersData, customEntriesData]);

  return (
    <div className="bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full p-2 shadow-2xl flex items-center justify-center">
                <img
                  src="/hf_logo.png"
                  alt="HF সমাজসেবা সংঘ লোগো"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              HF সমাজসেবা সংঘ
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-8 leading-relaxed">
              "সেই ব্যক্তি উত্তম যে মানুষের উপকার করে"
              <br />
              আসুন, একসাথে সমাজের অসহায় মানুষদের পাশে দাঁড়াই
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/donate"
                className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black py-4.5 px-9 md:px-10 rounded-full text-xl md:text-2xl transition-all duration-300 hover:scale-108 active:scale-95 shadow-2xl shadow-yellow-950/60 flex items-center justify-center gap-3 border-2 border-yellow-200/60 cursor-pointer tracking-wide"
              >
                <span className="text-2xl md:text-3xl">💝</span>
                <span>এখনই দান করুন</span>
              </Link>
              <Link
                href="/profile?mode=register"
                className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black py-4.5 px-9 md:px-10 rounded-full text-xl md:text-2xl transition-all duration-300 hover:scale-108 active:scale-95 shadow-2xl shadow-yellow-950/60 flex items-center justify-center gap-3 border-2 border-yellow-200/60 cursor-pointer tracking-wide"
              >
                <span className="text-2xl md:text-3xl">🤝</span>
                <span>আমাদের সাথে যুক্ত হোন</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 border-t border-blue-700/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-6">
              আমাদের উদ্দেশ্য
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed mb-8">
              HF সমাজসেবা সংঘ একটি অলাভজনক সামাজিক সংগঠন যা ২০২৫ সাল থেকে সমাজের অসহায়, দুঃস্থ ও 
              দরিদ্র মানুষদের সেবা করার লক্ষ্যে নিরলসভাবে কাজ করে যাচ্ছে। আমরা বিশ্বাস করি, প্রতিটি মানুষের 
              মৌলিক চাহিদা পূরণের অধিকার আছে। আপনাদের ভালোবাসায় ও সহযোগিতায় আমরা বহু পরিবারের 
              জীবনে ইতিবাচক পরিবর্তন আনতে বদ্ধপরিকর।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all">
                <div className="text-4xl mb-4">🍚</div>
                <h3 className="font-bold text-xl text-yellow-300 mb-2">খাদ্য সহায়তা</h3>
                <p className="text-blue-100">দরিদ্র পরিবারগুলোকে খাদ্য সামগ্রী বিতরণ</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-bold text-xl text-yellow-300 mb-2">শিক্ষা সহায়তা</h3>
                <p className="text-blue-100">মেধাবী ছাত্র-ছাত্রীদের বৃত্তি প্রদান</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/15 transition-all">
                <div className="text-4xl mb-4">🏥</div>
                <h3 className="font-bold text-xl text-yellow-300 mb-2">চিকিৎসা সহায়তা</h3>
                <p className="text-blue-100">অসুস্থ ও দরিদ্রদের চিকিৎসা খরচ বহন</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
