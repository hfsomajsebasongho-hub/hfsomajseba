"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserData {
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  totalDonation: number;
  donationCount: number;
  joinDate: string;
}

interface PendingDonation {
  donorName: string;
  donorPhone: string;
  amount: number;
  date: string;
  method: string;
  transactionId: string;
  donorBloodGroup: string;
  status?: string;
}

export default function AdminPanel() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([]);
  const [activeTab, setActiveTab] = useState("users");
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    totalAmount: 0,
    totalDonations: 0,
    pendingDonations: 0,
  });

  const ADMIN_PASSWORD = "admin@123";

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!adminPassword) {
      setPasswordError("পাসওয়ার্ড দিন");
      return;
    }

    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setAdminPassword("");
      loadAllData();
    } else {
      setPasswordError("পাসওয়ার্ড ভুল");
    }
  };

  // Load all data from localStorage
  const loadAllData = () => {
    // Load all users
    const users = JSON.parse(localStorage.getItem("allUsers") || "[]");
    setAllUsers(users);

    // Load pending donations
    const pending = JSON.parse(localStorage.getItem("pendingDonations") || "[]");
    setPendingDonations(pending);

    // Calculate stats
    const totalAmount = users.reduce((sum: number, user: UserData) => sum + (user.totalDonation || 0), 0);
    const totalDonationCount = users.reduce((sum: number, user: UserData) => sum + (user.donationCount || 0), 0);
    const pendingAmount = pending.length;

    setTotalStats({
      totalUsers: users.length,
      totalAmount: totalAmount,
      totalDonations: totalDonationCount,
      pendingDonations: pendingAmount,
    });
  };

  // Delete user
  const deleteUser = (phone: string) => {
    if (window.confirm("এই ব্যবহারকারী মুছে দিতে চান?")) {
      const updatedUsers = allUsers.filter(user => user.phone !== phone);
      localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
      setAllUsers(updatedUsers);
      setTotalStats({
        ...totalStats,
        totalUsers: updatedUsers.length,
      });
    }
  };

  // Delete pending donation
  const deletePendingDonation = (index: number) => {
    if (window.confirm("এই দান মুছে দিতে চান?")) {
      const updatedPending = pendingDonations.filter((_, i) => i !== index);
      localStorage.setItem("pendingDonations", JSON.stringify(updatedPending));
      setPendingDonations(updatedPending);
      setTotalStats({
        ...totalStats,
        pendingDonations: updatedPending.length,
      });
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm("সমস্ত ডেটা মুছে দিতে চান? এটি পূর্বাবাস করা যাবে না।")) {
      localStorage.removeItem("allUsers");
      localStorage.removeItem("pendingDonations");
      localStorage.removeItem("userData");
      setAllUsers([]);
      setPendingDonations([]);
      setTotalStats({
        totalUsers: 0,
        totalAmount: 0,
        totalDonations: 0,
        pendingDonations: 0,
      });
      alert("সমস্ত ডেটা মুছে দেওয়া হয়েছে");
    }
  };

  // Logout
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminPassword("");
    setAllUsers([]);
    setPendingDonations([]);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-blue-800">সুপার এডমিন</h1>
            <p className="text-gray-500 mt-2">প্যানেল এ স্বাগতম</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                এডমিন পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="পাসওয়ার্ড দিন"
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-2">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              লগইন করুন
            </button>

            <div className="text-center">
              <Link
                href="/"
                className="text-blue-600 hover:underline text-sm"
              >
                হোম এ ফিরুন
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-800 flex items-center gap-3">
              🔐 সুপার এডমিন প্যানেল
            </h1>
            <p className="text-gray-600 mt-2">সিস্টেম পরিচালনা এবং তথ্য দেখুন</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            লগআউট
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">মোট ব্যবহারকারী</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalStats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">মোট দান</p>
            <p className="text-3xl font-bold text-green-600 mt-2">৳ {totalStats.totalAmount.toLocaleString('bn-BD')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">মোট দান সংখ্যা</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{totalStats.totalDonations}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">অপেক্ষমাণ দান</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{totalStats.pendingDonations}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === "users"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              সকল ব্যবহারকারী ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              অপেক্ষমাণ দান ({pendingDonations.length})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === "settings"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              সেটিংস
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="p-6 overflow-x-auto">
              {allUsers.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4">নাম</th>
                      <th className="text-left py-3 px-4">ইমেইল</th>
                      <th className="text-left py-3 px-4">মোবাইল</th>
                      <th className="text-left py-3 px-4">রক্ত গ্রুপ</th>
                      <th className="text-left py-3 px-4">মোট দান</th>
                      <th className="text-left py-3 px-4">দান সংখ্যা</th>
                      <th className="text-left py-3 px-4">যোগদান তারিখ</th>
                      <th className="text-center py-3 px-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.phone}</td>
                        <td className="py-3 px-4">{user.bloodGroup || "-"}</td>
                        <td className="py-3 px-4">৳ {user.totalDonation.toLocaleString('bn-BD')}</td>
                        <td className="py-3 px-4">{user.donationCount}</td>
                        <td className="py-3 px-4">{user.joinDate}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteUser(user.phone)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
              )}
            </div>
          )}

          {/* Pending Donations Tab */}
          {activeTab === "pending" && (
            <div className="p-6 overflow-x-auto">
              {pendingDonations.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4">দাতার নাম</th>
                      <th className="text-left py-3 px-4">মোবাইল</th>
                      <th className="text-left py-3 px-4">দান পরিমাণ</th>
                      <th className="text-left py-3 px-4">পদ্ধতি</th>
                      <th className="text-left py-3 px-4">ট্রানজ্যাকশন ID</th>
                      <th className="text-left py-3 px-4">তারিখ</th>
                      <th className="text-center py-3 px-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDonations.map((donation, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">{donation.donorName}</td>
                        <td className="py-3 px-4">{donation.donorPhone}</td>
                        <td className="py-3 px-4">৳ {donation.amount.toLocaleString('bn-BD')}</td>
                        <td className="py-3 px-4">{donation.method}</td>
                        <td className="py-3 px-4">{donation.transactionId}</td>
                        <td className="py-3 px-4">{donation.date}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deletePendingDonation(index)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">কোনো অপেক্ষমাণ দান নেই</p>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="p-6">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-blue-800 mb-6">সিস্টেম সেটিংস</h2>
                
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold text-red-800 mb-4">⚠️ বিপদজনক এলাকা</h3>
                  <p className="text-gray-700 mb-4">
                    নিচের বাটনে ক্লিক করলে সমস্ত ডেটা মুছে যাবে। এই পদক্ষেপটি পূর্বাবাস করা যাবে না।
                  </p>
                  <button
                    onClick={clearAllData}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    সমস্ত ডেটা মুছুন
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">📊 সিস্টেম তথ্য</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>মোট ব্যবহারকারী:</strong> {totalStats.totalUsers}
                    </p>
                    <p className="text-gray-700">
                      <strong>মোট সংগৃহীত টাকা:</strong> ৳ {totalStats.totalAmount.toLocaleString('bn-BD')}
                    </p>
                    <p className="text-gray-700">
                      <strong>মোট দান সংখ্যা:</strong> {totalStats.totalDonations}
                    </p>
                    <p className="text-gray-700">
                      <strong>অপেক্ষমাণ দান:</strong> {totalStats.pendingDonations}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
