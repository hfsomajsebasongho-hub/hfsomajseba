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

export default function SuperAdminPanel() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([]);
  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [manualDonationUser, setManualDonationUser] = useState<UserData | null>(null);
  const [manualDonationAmount, setManualDonationAmount] = useState("");
  const [manualDonationDate, setManualDonationDate] = useState("");
  const [manualDonationMethod, setManualDonationMethod] = useState("নগদ");
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    totalAmount: 0,
    totalDonations: 0,
    pendingDonations: 0,
  });

  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "123456";

  // Check admin login status on component mount
  useEffect(() => {
    const checkAdminLoginStatus = () => {
      const savedAdminLoginStatus = localStorage.getItem("isAdminLoggedIn");
      if (savedAdminLoginStatus === "true") {
        setIsAdminLoggedIn(true);
        loadAllData();
      }
    };

    checkAdminLoginStatus();

    // Check admin login status when window gets focus
    window.addEventListener("focus", checkAdminLoginStatus);
    return () => {
      window.removeEventListener("focus", checkAdminLoginStatus);
    };
  }, []);

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!adminUsername.trim()) {
      setLoginError("ইউজার নেম দিন");
      return;
    }

    if (!adminPassword) {
      setLoginError("পাসওয়ার্ড দিন");
      return;
    }

    if (adminUsername === ADMIN_USERNAME && adminPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      localStorage.setItem("isAdminLoggedIn", "true");
      setAdminUsername("");
      setAdminPassword("");
      loadAllData();
    } else {
      setLoginError("ইউজার নেম বা পাসওয়ার্ড ভুল");
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
    const updatedPending = pendingDonations.filter((_, i) => i !== index);
    localStorage.setItem("pendingDonations", JSON.stringify(updatedPending));
    setPendingDonations(updatedPending);
    setTotalStats({
      ...totalStats,
      pendingDonations: updatedPending.length,
    });
  };

  // Approve pending donation
  const approvePendingDonation = (index: number) => {
    if (window.confirm("এই দান অনুমোদন করতে চান?")) {
      const donation = pendingDonations[index];
      
      // Load all users
      const allUsersData = JSON.parse(localStorage.getItem("allUsers") || "[]");
      
      // Find or create user
      const userIndex = allUsersData.findIndex((u: any) => u.phone === donation.donorPhone);
      
      if (userIndex !== -1) {
        // Update existing user
        allUsersData[userIndex].totalDonation = (allUsersData[userIndex].totalDonation || 0) + donation.amount;
        allUsersData[userIndex].donationCount = (allUsersData[userIndex].donationCount || 0) + 1;
      } else {
        // Create new user
        allUsersData.push({
          name: donation.donorName,
          email: "",
          phone: donation.donorPhone,
          bloodGroup: donation.donorBloodGroup || "",
          totalDonation: donation.amount,
          donationCount: 1,
          joinDate: donation.date,
        });
      }
      
      // Save updated users
      localStorage.setItem("allUsers", JSON.stringify(allUsersData));
      setAllUsers(allUsersData);
      
      // Update userData if user is currently logged in
      const savedUser = localStorage.getItem("userData");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.phone === donation.donorPhone) {
          // Update donation status in user's donation list
          if (userData.donations && Array.isArray(userData.donations)) {
            const donationIndex = userData.donations.findIndex((d: any) => 
              d.transactionId === donation.transactionId && d.amount === donation.amount
            );
            if (donationIndex !== -1) {
              userData.donations[donationIndex].status = "approved";
              localStorage.setItem("userData", JSON.stringify(userData));
            }
          }
        }
      }
      
      // Remove from pending
      deletePendingDonation(index);
      alert("দান অনুমোদিত হয়েছে");
    }
  };

  // Reject pending donation
  const rejectPendingDonation = (index: number) => {
    if (window.confirm("এই দান বাতিল করতে চান?")) {
      const donation = pendingDonations[index];
      
      // Update userData if user is currently logged in
      const savedUser = localStorage.getItem("userData");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.phone === donation.donorPhone) {
          // Update donation status in user's donation list
          if (userData.donations && Array.isArray(userData.donations)) {
            const donationIndex = userData.donations.findIndex((d: any) => 
              d.transactionId === donation.transactionId && d.amount === donation.amount
            );
            if (donationIndex !== -1) {
              userData.donations[donationIndex].status = "rejected";
              localStorage.setItem("userData", JSON.stringify(userData));
            }
          }
        }
      }
      
      deletePendingDonation(index);
      alert("দান বাতিল করা হয়েছে");
    }
  };

  // Open manual donation modal
  const openManualDonationModal = (user: UserData) => {
    setManualDonationUser(user);
    setManualDonationAmount("");
    setManualDonationDate(new Date().toISOString().split('T')[0]);
    setManualDonationMethod("নগদ");
  };

  // Close manual donation modal
  const closeManualDonationModal = () => {
    setManualDonationUser(null);
    setManualDonationAmount("");
    setManualDonationDate("");
    setManualDonationMethod("নগদ");
  };

  // Save manual donation
  const saveManualDonation = () => {
    if (!manualDonationUser) return;

    if (!manualDonationAmount || Number(manualDonationAmount) <= 0) {
      alert("সঠিক দান পরিমাণ দিন");
      return;
    }

    if (!manualDonationDate) {
      alert("তারিখ দিন");
      return;
    }

    const amount = Number(manualDonationAmount);
    const dateObj = new Date(manualDonationDate);
    const banglaDate = dateObj.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Update user in allUsers
    const updatedUsers = allUsers.map(user =>
      user.phone === manualDonationUser.phone
        ? {
            ...user,
            totalDonation: (user.totalDonation || 0) + amount,
            donationCount: (user.donationCount || 0) + 1,
          }
        : user
    );

    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);

    // Update userData if user is currently logged in
    const savedUser = localStorage.getItem("userData");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.phone === manualDonationUser.phone) {
        const newDonation = {
          amount: amount,
          date: banglaDate,
          method: manualDonationMethod,
          transactionId: "ম্যানুয়াল-" + Date.now(),
          status: "approved"
        };
        userData.donations = [newDonation, ...(userData.donations || [])];
        userData.totalDonation = (userData.totalDonation || 0) + amount;
        userData.donationCount = (userData.donationCount || 0) + 1;
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    }

    // Update stats
    setTotalStats({
      ...totalStats,
      totalAmount: totalStats.totalAmount + amount,
      totalDonations: totalStats.totalDonations + 1,
    });

    closeManualDonationModal();
    alert("ম্যানুয়াল দান সংরক্ষণ করা হয়েছে");
  };

  // Open edit modal
  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditBloodGroup(user.bloodGroup);

  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingUser(null);
    setEditName("");
    setEditPhone("");
    setEditBloodGroup("");
  };

  // Save edited user
  const saveEditedUser = () => {
    if (!editingUser) return;

    if (!editName.trim()) {
      alert("নাম দিন");
      return;
    }

    if (!editPhone.trim()) {
      alert("মোবাইল নম্বর দিন");
      return;
    }

    const updatedUsers = allUsers.map(user =>
      user.phone === editingUser.phone
        ? {
            ...user,
            name: editName,
            phone: editPhone,
            bloodGroup: editBloodGroup,
          }
        : user
    );

    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    closeEditModal();
    alert("ব্যবহারকারী আপডেট করা হয়েছে");
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
    localStorage.removeItem("isAdminLoggedIn");
    setAdminUsername("");
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
                ইউজার নেম
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="ইউজার নেম দিন"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="পাসওয়ার্ড দিন"
              />
              {loginError && (
                <p className="text-red-600 text-sm mt-2">{loginError}</p>
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
                        <td className="py-3 px-4 text-center space-x-2">
                          <button
                            onClick={() => openManualDonationModal(user)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            title="ম্যানুয়াল দান যোগ করুন"
                          >
                            💰 দান
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            এডিট
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
                      <th className="text-left py-3 px-4">রক্তের গ্রুপ</th>
                      <th className="text-left py-3 px-4">দান পরিমাণ</th>
                      <th className="text-left py-3 px-4">পদ্ধতি</th>
                      <th className="text-left py-3 px-4">ট্রানজ্যাকশন ID</th>
                      <th className="text-left py-3 px-4">তারিখ</th>
                      <th className="text-left py-3 px-4">স্ট্যাটাস</th>
                      <th className="text-center py-3 px-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDonations.map((donation, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{donation.donorName}</td>
                        <td className="py-3 px-4">{donation.donorPhone}</td>
                        <td className="py-3 px-4">
                          {donation.donorBloodGroup ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                              {donation.donorBloodGroup}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-green-600">৳ {donation.amount.toLocaleString('bn-BD')}</td>
                        <td className="py-3 px-4">{donation.method}</td>
                        <td className="py-3 px-4 text-sm">{donation.transactionId}</td>
                        <td className="py-3 px-4">{donation.date}</td>
                        <td className="py-3 px-4">
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                            অপেক্ষমাণ
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button
                            onClick={() => approvePendingDonation(index)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            এপ্রুভ
                          </button>
                          <button
                            onClick={() => rejectPendingDonation(index)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            বাতিল
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

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-800">ব্যবহারকারী এডিট করুন</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    নাম
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    রক্তের গ্রুপ
                  </label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  >
                    <option value="">নির্বাচন করুন</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={saveEditedUser}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Donation Modal */}
        {manualDonationUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-800">💰 ম্যানুয়াল দান যোগ করুন</h2>
                <button
                  onClick={closeManualDonationModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">দাতা</p>
                  <p className="text-lg font-bold text-purple-800">{manualDonationUser.name}</p>
                  <p className="text-sm text-gray-500">{manualDonationUser.phone}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    দান পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    value={manualDonationAmount}
                    onChange={(e) => setManualDonationAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                    placeholder="পরিমাণ দিন"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    তারিখ
                  </label>
                  <input
                    type="date"
                    value={manualDonationDate}
                    onChange={(e) => setManualDonationDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    পদ্ধতি
                  </label>
                  <select
                    value={manualDonationMethod}
                    onChange={(e) => setManualDonationMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-600"
                  >
                    <option value="নগদ">নগদ</option>
                    <option value="বিকাশ">বিকাশ</option>
                    <option value="রকেট">রকেট</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeManualDonationModal}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={saveManualDonation}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  দান সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
