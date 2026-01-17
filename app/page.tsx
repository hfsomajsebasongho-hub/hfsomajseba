"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import StatsCard from "./components/StatsCard";

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

  useEffect(() => {
    // Load all donations from localStorage
    const savedUser = localStorage.getItem("userData");
    let donations: Donor[] = [];
    let totalDonationAmount = 0;
    let donorCount = 0;

    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.donations && userData.donations.length > 0) {
        donations = userData.donations.map((d: any) => ({
          name: userData.name,
          amount: d.amount,
          date: d.date,
          isAnonymous: false,
        }));
        totalDonationAmount = userData.totalDonation || 0;
        donorCount++;
      }
    }

    // Get all pending donations from other donors
    const pendingDonations = localStorage.getItem("pendingDonations");
    if (pendingDonations) {
      const pending = JSON.parse(pendingDonations);
      pending.forEach((d: any) => {
        donations.push({
          name: d.donorName === "বেনামী" ? "বেনামী দাতা" : d.donorName,
          amount: d.amount,
          date: d.date,
          isAnonymous: d.donorName === "বেনামী",
        });
        totalDonationAmount += d.amount;
        donorCount++;
      });
    }

    // Sort by date (newest first) and take only 10
    donations.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    setRecentDonors(donations.slice(0, 10));
    setTotalAmount(totalDonationAmount);
    setTotalDonors(donorCount);
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">🤝</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              হিলফুল ফুজুল সমাজসেবা সংঘ
            </h1>
            <p className="text-xl md:text-2xl text-blue-200 mb-8 leading-relaxed">
              "সেই ব্যক্তি উত্তম যে মানুষের উপকার করে"
              <br />
              আসুন, একসাথে সমাজের অসহায় মানুষদের পাশে দাঁড়াই
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/donate"
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
              >
                💝 এখনই দান করুন
              </Link>
              <Link
                href="/about"
                className="border-2 border-white hover:bg-white hover:text-blue-900 font-bold py-4 px-8 rounded-full text-lg transition-all"
              >
                আমাদের সম্পর্কে জানুন
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatsCard
              icon="💰"
              value={totalAmount > 0 ? `৳ ${totalAmount.toLocaleString('bn-BD')}` : "৳ ০"}
              label="মোট সংগৃহীত"
              color="bg-gradient-to-br from-green-500 to-green-700"
            />
            <StatsCard
              icon="👥"
              value={totalDonors > 0 ? `${totalDonors}` : "০"}
              label="মোট দাতা"
              color="bg-gradient-to-br from-blue-500 to-blue-700"
            />
            <StatsCard
              icon="🏠"
              value={totalDonors > 0 ? `${totalDonors}+` : "০"}
              label="পরিবার সাহায্যপ্রাপ্ত"
              color="bg-gradient-to-br from-purple-500 to-purple-700"
            />
            <StatsCard
              icon="📅"
              value="১ বছর"
              label="সেবার বছর"
              color="bg-gradient-to-br from-orange-500 to-orange-700"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-6">
              আমাদের উদ্দেশ্য
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              হিলফুল ফুজুল সমাজসেবা সংঘ একটি অলাভজনক সংগঠন যা সমাজের অসহায়, দুঃস্থ ও 
              দরিদ্র মানুষদের সেবা করার লক্ষ্যে কাজ করছে। আমরা বিশ্বাস করি, প্রতিটি মানুষের 
              মৌলিক চাহিদা পূরণের অধিকার আছে। আপনার সামান্য সাহায্যে আমরা অনেক পরিবারের 
              জীবনে ইতিবাচক পরিবর্তন আনতে পারি।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="text-4xl mb-4">🍚</div>
                <h3 className="font-bold text-lg text-blue-800 mb-2">খাদ্য সহায়তা</h3>
                <p className="text-gray-600">দরিদ্র পরিবারগুলোকে খাদ্য সামগ্রী বিতরণ</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-bold text-lg text-green-800 mb-2">শিক্ষা সহায়তা</h3>
                <p className="text-gray-600">মেধাবী ছাত্র-ছাত্রীদের বৃত্তি প্রদান</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl">
                <div className="text-4xl mb-4">🏥</div>
                <h3 className="font-bold text-lg text-purple-800 mb-2">চিকিৎসা সহায়তা</h3>
                <p className="text-gray-600">অসুস্থ ও দরিদ্রদের চিকিৎসা খরচ বহন</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Donors Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
              সাম্প্রতিক দাতাগণ
            </h2>
            <p className="text-gray-600 text-lg">
              যারা সম্প্রতি দান করে আমাদের সাথে যুক্ত হয়েছেন
            </p>
          </div>
          {recentDonors.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="text-left py-3 px-4">দাতার নাম</th>
                      <th className="text-left py-3 px-4">দান পরিমাণ</th>
                      <th className="text-left py-3 px-4">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDonors.map((donor, index) => (
                      <tr
                        key={index}
                        onClick={() => setSelectedDonor(donor)}
                        className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-blue-600 hover:underline">
                            {donor.isAnonymous ? "বেনামী দাতা" : donor.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-green-600">
                          ৳ {donor.amount.toLocaleString('bn-BD')}
                        </td>
                        <td className="py-3 px-4 text-gray-600">{donor.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">এখনো কোনো দান পাওয়া যায়নি</h3>
              <p className="text-gray-500">প্রথম দাতা হতে আজই যোগ দিন!</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              href="/donors"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              সব দাতাদের দেখুন →
            </Link>
          </div>
        </div>
      </section>

      {/* Donor Details Modal */}
      {selectedDonor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-800">দাতার বিবরণ</h2>
              <button
                onClick={() => setSelectedDonor(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">দাতার নাম</p>
                <p className="text-xl font-bold text-blue-800">
                  {selectedDonor.isAnonymous ? "বেনামী দাতা" : selectedDonor.name}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">দান পরিমাণ</p>
                <p className="text-2xl font-bold text-green-600">
                  ৳ {selectedDonor.amount.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">দান তারিখ</p>
                <p className="text-lg font-semibold text-gray-800">
                  {selectedDonor.date}
                </p>
              </div>
              {selectedDonor.isAnonymous && (
                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                  <p className="text-yellow-700 font-medium">🤫 বেনামে দান করা হয়েছে</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedDonor(null)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Donation Methods Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
              দান করার মাধ্যম
            </h2>
            <p className="text-gray-600 text-lg">
              সহজেই আপনার পছন্দের মাধ্যমে দান করুন
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-pink-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
              <img src="/bkash.png" alt="বিকাশ" className="w-16 h-16 mx-auto mb-4 object-contain" />
              <h3 className="font-bold text-lg text-pink-700">বিকাশ</h3>
              <p className="text-blue-600 font-bold text-lg mt-2">01711578574</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
              <img src="/nagad.png" alt="নগদ" className="w-16 h-16 mx-auto mb-4 object-contain" />
              <h3 className="font-bold text-lg text-orange-700">নগদ</h3>
              <p className="text-blue-600 font-bold text-lg mt-2">01711578574</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl text-center hover:shadow-lg transition-shadow">
              <img src="/rocket.png" alt="রকেট" className="w-16 h-16 mx-auto mb-4 object-contain" />
              <h3 className="font-bold text-lg text-purple-700">রকেট</h3>
              <p className="text-blue-600 font-bold text-lg mt-2">01711578574</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6">
            আজই যোগ দিন আমাদের মিশনে
          </h2>
          <p className="text-xl text-blue-800 mb-8 max-w-2xl mx-auto">
            আপনার সামান্য দানে একটি পরিবারের মুখে হাসি ফুটতে পারে।
            আসুন, একসাথে একটি সুন্দর সমাজ গড়ি।
          </p>
          <Link
            href="/donate"
            className="inline-block bg-blue-800 hover:bg-blue-900 text-white font-bold py-4 px-10 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
          >
            💝 এখনই দান করুন
          </Link>
        </div>
      </section>
    </div>
  );
}
