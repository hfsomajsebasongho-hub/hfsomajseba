"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// User data type
interface Donation {
  amount: number;
  date: string;
  method: string;
  transactionId?: string;
  senderPhone?: string;
  status?: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  totalDonation: number;
  donationCount: number;
  joinDate: string;
  donations: Donation[];
}

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Registration form state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBloodGroup, setRegBloodGroup] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // User data state
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    bloodGroup: "",
    totalDonation: 0,
    donationCount: 0,
    joinDate: "",
    donations: [],
  });

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editError, setEditError] = useState("");

  // Load user data from localStorage on mount and when page gets focus
  useEffect(() => {
    const loadUserData = () => {
      const savedUser = localStorage.getItem("userData");
      const savedLoginStatus = localStorage.getItem("isLoggedIn");
      
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setUserData(user);
        
        // Ensure user is in allUsers list (for existing users)
        const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const existingIndex = allUsers.findIndex((u: any) => u.email === user.email || u.phone === user.phone);
        if (existingIndex === -1 && user.name) {
          allUsers.push({
            name: user.name,
            email: user.email,
            phone: user.phone,
            bloodGroup: user.bloodGroup || "",
            joinDate: user.joinDate,
            totalDonation: user.totalDonation || 0,
            donationCount: user.donationCount || 0,
          });
          localStorage.setItem("allUsers", JSON.stringify(allUsers));
        } else if (existingIndex !== -1) {
          // Update existing user data
          allUsers[existingIndex] = {
            ...allUsers[existingIndex],
            name: user.name,
            email: user.email,
            phone: user.phone,
            bloodGroup: user.bloodGroup || "",
            totalDonation: user.totalDonation || 0,
            donationCount: user.donationCount || 0,
          };
          localStorage.setItem("allUsers", JSON.stringify(allUsers));
        }
      }
      if (savedLoginStatus === "true") {
        setIsLoggedIn(true);
      }
    };
    
    loadUserData();
    
    // Reload data when window gets focus (user returns to this tab)
    window.addEventListener("focus", loadUserData);
    
    return () => {
      window.removeEventListener("focus", loadUserData);
    };
  }, []);

  // Save user data to localStorage
  const saveUserData = (data: UserData) => {
    localStorage.setItem("userData", JSON.stringify(data));
    setUserData(data);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!loginEmail.trim()) {
      setLoginError("ইমেইল বা মোবাইল নম্বর দিন");
      return;
    }
    if (!loginPassword) {
      setLoginError("পাসওয়ার্ড দিন");
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    
    // First check current userData
    const savedUser = localStorage.getItem("userData");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Check if email or phone matches
      if ((user.email === loginEmail || user.phone === loginEmail)) {
        setUserData(user);
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
        // Clear form
        setLoginEmail("");
        setLoginPassword("");
        return;
      }
    }
    
    // If not found in userData, check in allUsers
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const foundUser = allUsers.find((u: any) => u.email === loginEmail || u.phone === loginEmail);
    
    if (foundUser) {
      // Load user data from allUsers
      const userToLoad: UserData = {
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
        bloodGroup: foundUser.bloodGroup || "",
        totalDonation: foundUser.totalDonation || 0,
        donationCount: foundUser.donationCount || 0,
        joinDate: foundUser.joinDate || "",
        donations: foundUser.donations || [],
      };
      
      localStorage.setItem("userData", JSON.stringify(userToLoad));
      setUserData(userToLoad);
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true");
      // Clear form
      setLoginEmail("");
      setLoginPassword("");
    } else {
      setLoginError("কোনো একাউন্ট পাওয়া যায়নি। প্রথমে রেজিস্টার করুন।");
    }
  };

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    
    if (!regName.trim()) {
      setRegError("আপনার নাম দিন");
      return;
    }
    if (!regPhone.trim()) {
      setRegError("মোবাইল নম্বর দিন");
      return;
    }
    // Validate phone number (Bangladeshi format)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(regPhone)) {
      setRegError("সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)");
      return;
    }
    if (!regBloodGroup) {
      setRegError("রক্তের গ্রুপ নির্বাচন করুন");
      return;
    }
    if (!regEmail.trim()) {
      setRegError("ইমেইল দিন");
      return;
    }
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegError("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    if (!regPassword) {
      setRegError("পাসওয়ার্ড দিন");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("পাসওয়ার্ড মিলছে না");
      return;
    }
    
    // Create new user data
    const today = new Date();
    const banglaDate = today.toLocaleDateString('bn-BD', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const newUserData: UserData = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      bloodGroup: regBloodGroup,
      totalDonation: 0,
      donationCount: 0,
      joinDate: banglaDate,
      donations: [],
    };
    
    // Save to localStorage
    saveUserData(newUserData);
    localStorage.setItem("isLoggedIn", "true");
    
    // Add to allUsers list
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    // Check if user already exists (by email or phone)
    const existingIndex = allUsers.findIndex((u: any) => u.email === regEmail || u.phone === regPhone);
    if (existingIndex === -1) {
      allUsers.push({
        name: regName,
        email: regEmail,
        phone: regPhone,
        bloodGroup: regBloodGroup,
        joinDate: banglaDate,
        totalDonation: 0,
        donationCount: 0,
      });
      localStorage.setItem("allUsers", JSON.stringify(allUsers));
    }
    
    // Show success message
    setRegSuccess(true);
    
    // Clear form and login
    setTimeout(() => {
      setRegName("");
      setRegPhone("");
      setRegBloodGroup("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
      setIsLoggedIn(true);
      setRegSuccess(false);
    }, 1500);
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userData");
    setUserData({
      name: "",
      email: "",
      phone: "",
      bloodGroup: "",
      totalDonation: 0,
      donationCount: 0,
      joinDate: "",
      donations: [],
    });
    setLoginEmail("");
    setLoginPassword("");
  };

  // Start editing profile
  const startEditing = () => {
    setEditName(userData.name);
    setEditEmail(userData.email);
    setEditPhone(userData.phone);
    setEditBloodGroup(userData.bloodGroup);
    setEditError("");
    setIsEditing(true);
  };

  // Save profile changes
  const saveProfile = () => {
    setEditError("");
    
    if (!editName.trim()) {
      setEditError("নাম দিন");
      return;
    }
    if (!editPhone.trim()) {
      setEditError("মোবাইল নম্বর দিন");
      return;
    }
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(editPhone)) {
      setEditError("সঠিক মোবাইল নম্বর দিন");
      return;
    }
    if (!editEmail.trim()) {
      setEditError("ইমেইল দিন");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      setEditError("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    
    const updatedUserData = {
      ...userData,
      name: editName,
      email: editEmail,
      phone: editPhone,
      bloodGroup: editBloodGroup,
    };
    
    saveUserData(updatedUserData);
    
    // Update allUsers list
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const existingIndex = allUsers.findIndex((u: any) => u.email === userData.email || u.phone === userData.phone);
    if (existingIndex !== -1) {
      allUsers[existingIndex] = {
        ...allUsers[existingIndex],
        name: editName,
        email: editEmail,
        phone: editPhone,
        bloodGroup: editBloodGroup,
        totalDonation: updatedUserData.totalDonation,
        donationCount: updatedUserData.donationCount,
      };
    } else {
      allUsers.push({
        name: editName,
        email: editEmail,
        phone: editPhone,
        bloodGroup: editBloodGroup,
        joinDate: userData.joinDate,
        totalDonation: updatedUserData.totalDonation,
        donationCount: updatedUserData.donationCount,
      });
    }
    localStorage.setItem("allUsers", JSON.stringify(allUsers));
    
    setIsEditing(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* Login/Register Toggle */}
            <div className="flex bg-gray-200 rounded-full p-1 mb-8">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-3 rounded-full font-bold transition-colors ${
                  showLogin ? "bg-blue-600 text-white" : "text-gray-600"
                }`}
              >
                লগইন
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-3 rounded-full font-bold transition-colors ${
                  !showLogin ? "bg-blue-600 text-white" : "text-gray-600"
                }`}
              >
                রেজিস্টার
              </button>
            </div>

            {showLogin ? (
              /* Login Form */
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">👤</div>
                  <h1 className="text-2xl font-bold text-blue-800">লগইন করুন</h1>
                  <p className="text-gray-600">আপনার একাউন্টে প্রবেশ করুন</p>
                </div>

                {loginError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    ⚠️ {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">ইমেইল / মোবাইল</label>
                    <input
                      type="text"
                      placeholder="আপনার ইমেইল বা মোবাইল নম্বর"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">পাসওয়ার্ড</label>
                    <input
                      type="password"
                      placeholder="আপনার পাসওয়ার্ড"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors"
                  >
                    লগইন
                  </button>
                </form>

                <div className="text-center mt-6">
                  <a href="#" className="text-blue-600 hover:underline">পাসওয়ার্ড ভুলে গেছেন?</a>
                </div>
              </div>
            ) : (
              /* Register Form */
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">📝</div>
                  <h1 className="text-2xl font-bold text-blue-800">রেজিস্টার করুন</h1>
                  <p className="text-gray-600">নতুন একাউন্ট তৈরি করুন</p>
                </div>

                {regError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    ⚠️ {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                    ✅ রেজিস্ট্রেশন সফল হয়েছে! লগইন করা হচ্ছে...
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">আপনার নাম <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="পুরো নাম"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">রক্তের গ্রুপ <span className="text-red-500">*</span></label>
                    <select
                      value={regBloodGroup}
                      onChange={(e) => setRegBloodGroup(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">রক্তের গ্রুপ নির্বাচন করুন</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">ইমেইল <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      placeholder="আপনার ইমেইল"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">পাসওয়ার্ড <span className="text-red-500">*</span></label>
                    <input
                      type="password"
                      placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-500">*</span></label>
                    <input
                      type="password"
                      placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={regSuccess}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors"
                  >
                    রেজিস্টার করুন
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl">
                👤
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                <p className="text-blue-200">সদস্য থেকে: {userData.joinDate}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full font-bold transition-colors"
              >
                লগআউট
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-2">💰</div>
              <p className="text-3xl font-bold text-green-600">৳ {userData.totalDonation.toLocaleString('bn-BD')}</p>
              <p className="text-gray-600">মোট দান</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-2">🎁</div>
              <p className="text-3xl font-bold text-blue-600">{userData.donationCount}</p>
              <p className="text-gray-600">দানের সংখ্যা</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md text-center">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-3xl font-bold text-yellow-600">গোল্ড</p>
              <p className="text-gray-600">দাতা র‍্যাংক</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <span>📋</span> প্রোফাইল তথ্য
              </h2>
              
              {isEditing ? (
                // Edit Form
                <div className="space-y-4">
                  {editError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                      ⚠️ {editError}
                    </div>
                  )}
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">নাম</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">ইমেইল</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">মোবাইল</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm mb-1">রক্তের গ্রুপ</label>
                    <select
                      value={editBloodGroup}
                      onChange={(e) => setEditBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">রক্তের গ্রুপ নির্বাচন করুন</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={saveProfile}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors"
                    >
                      ✓ সংরক্ষণ করুন
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition-colors"
                    >
                      ✕ বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                // Display Info
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-500 text-sm">নাম</label>
                      <p className="font-medium">{userData.name || "সেট করা হয়নি"}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-sm">ইমেইল</label>
                      <p className="font-medium">{userData.email || "সেট করা হয়নি"}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-sm">মোবাইল</label>
                      <p className="font-medium">{userData.phone || "সেট করা হয়নি"}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 text-sm">রক্তের গ্রুপ</label>
                      <p className="font-medium">
                        {userData.bloodGroup ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                            {userData.bloodGroup}
                          </span>
                        ) : (
                          "সেট করা হয়নি"
                        )}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={startEditing}
                    className="mt-6 text-blue-600 hover:underline font-medium"
                  >
                    ✏️ তথ্য সম্পাদনা করুন
                  </button>
                </>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <span>🏆</span> অর্জন
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-1">🥇</div>
                  <p className="text-xs text-gray-600">প্রথম দান</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">💎</div>
                  <p className="text-xs text-gray-600">৫+ দান</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">🌟</div>
                  <p className="text-xs text-gray-600">২৫,০০০+ টাকা</p>
                </div>
                <div className="text-center opacity-30">
                  <div className="text-3xl mb-1">👑</div>
                  <p className="text-xs text-gray-600">১০+ দান</p>
                </div>
                <div className="text-center opacity-30">
                  <div className="text-3xl mb-1">🎖️</div>
                  <p className="text-xs text-gray-600">৫০,০০০+ টাকা</p>
                </div>
                <div className="text-center opacity-30">
                  <div className="text-3xl mb-1">🏅</div>
                  <p className="text-xs text-gray-600">১ বছর</p>
                </div>
              </div>
            </div>
          </div>

          {/* Donation History */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                <span>📜</span> দানের ইতিহাস
              </h2>
              <Link href="/donate" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors">
                + নতুন দান
              </Link>
            </div>
            {userData.donations && userData.donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 px-4 text-gray-600">তারিখ</th>
                      <th className="text-left py-3 px-4 text-gray-600">পরিমাণ</th>
                      <th className="text-left py-3 px-4 text-gray-600">মাধ্যম</th>
                      <th className="text-left py-3 px-4 text-gray-600">ট্রান্সজেকশন</th>
                      <th className="text-left py-3 px-4 text-gray-600">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.donations.map((donation, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 px-4">{donation.date}</td>
                        <td className="py-4 px-4 font-bold text-green-600">৳ {donation.amount.toLocaleString('bn-BD')}</td>
                        <td className="py-4 px-4">{donation.method}</td>
                        <td className="py-4 px-4 font-mono font-bold text-blue-600">{donation.transactionId || "-"}</td>
                        <td className="py-4 px-4">
                          {donation.status === "pending" ? (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                              ⏳ যাচাইয়ের অপেক্ষায়
                            </span>
                          ) : donation.status === "approved" ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              ✓ অনুমোদিত
                            </span>
                          ) : donation.status === "rejected" ? (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                              ✗ বাতিল
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              ✓ সম্পন্ন
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">কোনো দান পাওয়া যায়নি</h3>
                <p className="text-gray-500 mb-4">আপনি এখনো কোনো দান করেননি</p>
                <Link href="/donate" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-colors">
                  এখনই দান করুন 💝
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
