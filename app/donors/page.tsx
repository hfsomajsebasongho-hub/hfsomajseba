"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DonorCard from "../components/DonorCard";
import { subscribeAllUsers } from "@/lib/dbSync";

interface Donor {
  name: string;
  amount: number;
  date: string;
  isAnonymous?: boolean;
  donationCount?: number;
  phone?: string;
  joinDate?: string;
  bloodGroup?: string;
}

export default function DonorsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allDonors, setAllDonors] = useState<Donor[]>([]);
  const [topDonors, setTopDonors] = useState<Donor[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Check login status & subscribe to Firestore
  useEffect(() => {
    const checkLoginStatus = () => {
      const savedLoginStatus = localStorage.getItem("isLoggedIn");
      setIsLoggedIn(savedLoginStatus === "true");
      setIsLoading(false);
    };

    checkLoginStatus();

    const unsub = subscribeAllUsers(() => {});

    // Check login status when window gets focus
    window.addEventListener("focus", checkLoginStatus);
    return () => {
      unsub();
      window.removeEventListener("focus", checkLoginStatus);
    };
  }, []);

  useEffect(() => {
    // Only load donors if user is logged in
    if (!isLoggedIn) return;
    // Load all donations from localStorage
    const savedUser = localStorage.getItem("userData");
    let allDonations: any[] = [];
    let totalDonationAmount = 0;
    let uniqueDonorMap = new Map<string, { totalAmount: number; donationCount: number; date: string; isAnonymous: boolean; phone?: string; joinDate: string; bloodGroup?: string }>();

    // Load all registered users from allUsers list
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    allUsers.forEach((user: any) => {
      allDonations.push({
        name: user.name,
        amount: user.totalDonation || 0,
        date: user.joinDate || "",
        isAnonymous: false,
        phone: user.phone || "",
        joinDate: user.joinDate || "",
        bloodGroup: user.bloodGroup || "",
        donationCount: user.donationCount || 0,
      });
      totalDonationAmount += user.totalDonation || 0;
    });

    // Also check current logged in user (in case they're not in allUsers yet)
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.name) {
        // Check if user already exists in allDonations
        const existsInList = allDonations.some((d: any) => d.phone === userData.phone || d.name === userData.name);
        if (!existsInList) {
          allDonations.push({
            name: userData.name,
            amount: userData.totalDonation || 0,
            date: userData.joinDate || "",
            isAnonymous: false,
            phone: userData.phone || "",
            joinDate: userData.joinDate || "",
            bloodGroup: userData.bloodGroup || "",
            donationCount: userData.donationCount || 0,
          });
          totalDonationAmount += userData.totalDonation || 0;
        } else {
          // Update existing user with latest data
          const existingIndex = allDonations.findIndex((d: any) => d.phone === userData.phone || d.name === userData.name);
          if (existingIndex !== -1) {
            allDonations[existingIndex] = {
              ...allDonations[existingIndex],
              name: userData.name,
              phone: userData.phone || "",
              bloodGroup: userData.bloodGroup || "",
              amount: userData.totalDonation || 0,
              donationCount: userData.donationCount || 0,
            };
          }
        }
      }
    }

    // Group donations by donor name (only approved user donations and totalDonation stats)

    // Group donations by donor name
    allDonations.forEach((donation) => {
      const key = donation.name;
      if (uniqueDonorMap.has(key)) {
        const existing = uniqueDonorMap.get(key)!;
        existing.totalAmount += donation.amount;
        existing.donationCount += 1;
        // Update date to most recent
        const existingDate = new Date(existing.date);
        const newDate = new Date(donation.date);
        if (newDate > existingDate) {
          existing.date = donation.date;
        }
      } else {
        uniqueDonorMap.set(key, {
          totalAmount: donation.amount,
          donationCount: 1,
          date: donation.date,
          isAnonymous: donation.isAnonymous,
          phone: donation.phone,
          joinDate: donation.joinDate,
          bloodGroup: donation.bloodGroup,
        });
      }
    });

    // Convert map to donor array
    const uniqueDonors: Donor[] = Array.from(uniqueDonorMap.entries()).map(([name, data]) => ({
      name,
      amount: data.totalAmount,
      date: data.date,
      isAnonymous: data.isAnonymous,
      donationCount: data.donationCount,
      phone: data.phone,
      joinDate: data.joinDate,
      bloodGroup: data.bloodGroup,
    }));

    // Sort by amount descending
    uniqueDonors.sort((a, b) => (b.amount || 0) - (a.amount || 0));

    // Get top donors
    const topDonorsArr = uniqueDonors
      .filter(d => !d.isAnonymous)
      .slice(0, 5);

    setAllDonors(uniqueDonors);
    setTopDonors(topDonorsArr);
    setTotalAmount(totalDonationAmount);
    setTotalCount(uniqueDonors.length);
  }, [isLoggedIn]);

  const averageDonation = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 py-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-solid mx-auto mb-4"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // Show login required message if not logged in
  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 py-16 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-6xl mb-6">🔒</div>
              <h1 className="text-3xl font-bold text-blue-800 mb-4">
                লগইন প্রয়োজন
              </h1>
              <p className="text-gray-600 mb-6">
                দাতাদের তালিকা দেখতে আপনাকে প্রথমে লগইন করতে হবে। লগইন করলে আপনি সকল দাতাদের তথ্য দেখতে পারবেন।
              </p>
              <div className="space-y-4">
                <Link 
                  href="/profile" 
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  লগইন করুন
                </Link>
                <p className="text-gray-500 text-sm">
                  একাউন্ট নেই? <Link href="/profile" className="text-blue-600 hover:underline">রেজিস্ট্রেশন করুন</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            🏆 দাতাদের তালিকা
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            যারা তাদের মূল্যবান অনুদানের মাধ্যমে আমাদের মিশনে অংশ নিয়েছেন
          </p>
        </div>

        {/* Top Donors */}
        {topDonors.length > 0 && (
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-bold text-center text-yellow-600 mb-8">
              🌟 শীর্ষ দাতাগণ
            </h2>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8">
              <div className="space-y-4">
                {topDonors.map((donor, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                      index === 0 ? "bg-yellow-400 text-yellow-900" :
                      index === 1 ? "bg-gray-300 text-gray-700" :
                      index === 2 ? "bg-orange-400 text-orange-900" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{donor.name}</h3>
                      <p className="text-gray-500 text-sm">{donor.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-bold text-xl">৳ {donor.amount.toLocaleString('bn-BD')}</p>
                      {index === 0 && <span className="text-yellow-500">👑</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Donors */}
        {allDonors.length > 0 ? (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-blue-800 mb-8">
              সকল দাতাগণ
            </h2>
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="text-left py-3 px-4">#</th>
                    <th className="text-left py-3 px-4">দাতার নাম</th>
                    <th className="text-left py-3 px-4">মোট দান</th>
                    <th className="text-left py-3 px-4">দান সংখ্যা</th>
                    <th className="text-left py-3 px-4">মোবাইল নাম্বার</th>
                    <th className="text-left py-3 px-4">রক্তের গ্রুপ</th>
                    <th className="text-left py-3 px-4">যোগদান তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {allDonors.map((donor, index) => (
                    <tr
                      key={index}
                      onClick={() => setSelectedDonor(donor)}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-600 font-medium">{index + 1}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-blue-600 hover:underline">
                          {donor.isAnonymous ? "বেনামী দাতা" : donor.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-green-600">
                        ৳ {donor.amount.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {donor.donationCount} বার
                      </td>
                      <td className="py-3 px-4 text-gray-600">{donor.phone || "-"}</td>
                      <td className="py-3 px-4">
                        {donor.bloodGroup ? (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold text-sm">
                            {donor.bloodGroup}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{donor.joinDate || donor.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="text-6xl mb-4">🤝</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">এখনো কোনো দান পাওয়া যায়নি</h2>
            <p className="text-gray-500 mb-6">প্রথম দাতা হতে আজই যোগ দিন এবং আমাদের মিশনে অংশ নিন</p>
          </div>
        )}

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
                  <p className="text-gray-600 text-sm">মোট দান</p>
                  <p className="text-2xl font-bold text-green-600">
                    ৳ {selectedDonor.amount.toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">দান সংখ্যা</p>
                  <p className="text-xl font-bold text-purple-600">
                    {selectedDonor.donationCount} বার
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">মোবাইল নাম্বার</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedDonor.phone || "বিদ্যমান নেই"}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">রক্তের গ্রুপ</p>
                  <p className="text-lg font-semibold">
                    {selectedDonor.bloodGroup ? (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                        {selectedDonor.bloodGroup}
                      </span>
                    ) : (
                      <span className="text-gray-400">বিদ্যমান নেই</span>
                    )}
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm">যোগদান তারিখ</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedDonor.joinDate || selectedDonor.date}
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

        {/* Stats Summary */}
        {totalAmount > 0 && (
          <div className="max-w-4xl mx-auto mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-6">মোট সংগ্রহ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-4xl font-bold text-yellow-400">৳ {totalAmount.toLocaleString('bn-BD')}</p>
                  <p className="text-blue-200">মোট দান</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-yellow-400">{totalCount}</p>
                  <p className="text-blue-200">মোট দাতা</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-yellow-400">৳ {averageDonation.toLocaleString('bn-BD')}</p>
                  <p className="text-blue-200">গড় দান</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
