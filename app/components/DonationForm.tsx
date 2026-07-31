"use client";

import { useState, useEffect } from "react";
import { addPendingDonationToDb, saveAllUsersToDb } from "@/lib/dbSync";

export default function DonationForm() {
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showTransactionInput, setShowTransactionInput] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const predefinedAmounts = [100, 500, 1000, 2000, 5000, 10000];

  const paymentMethods = [
    { id: "bkash", name: "বিকাশ", icon: "/bkash.png", number: "01601236232", color: "bg-pink-50 border-pink-300" },
    { id: "nagad", name: "নগদ", icon: "/nagad.png", number: "01601236232", color: "bg-orange-50 border-orange-300" },
    { id: "rocket", name: "রকেট", icon: "/rocket.png", number: "01601236232", color: "bg-purple-50 border-purple-300" },
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem("userData");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.name) setName(u.name);
        if (u.phone) setPhone(u.phone);
        if (u.bloodGroup) setBloodGroup(u.bloodGroup);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showTransactionInput) {
      // First click - show transaction input
      setShowTransactionInput(true);
      return;
    }
    
    // Second click - submit with transaction ID
    if (!senderPhone.trim()) {
      alert("অনুগ্রহ করে যে নম্বর থেকে টাকা পাঠিয়েছেন সেটা দিন");
      return;
    }
    if (!transactionId.trim()) {
      alert("অনুগ্রহ করে ট্রান্সজেকশন আইডি দিন");
      return;
    }
    
    const donationAmount = Number(customAmount || amount);
    
    const today = new Date();
    const banglaDate = today.toLocaleDateString('bn-BD', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    const paymentMethodName = paymentMethods.find(p => p.id === paymentMethod)?.name || paymentMethod;
    
    const savedUserStr = localStorage.getItem("userData");
    const savedUserObj = savedUserStr ? JSON.parse(savedUserStr) : null;

    const donorPhoneVal = isAnonymous ? "-" : (phone || (savedUserObj ? savedUserObj.phone : "") || senderPhone || "-").trim();
    const donorBloodGroupVal = isAnonymous ? "-" : (bloodGroup || (savedUserObj ? savedUserObj.bloodGroup : "") || "-").trim();
    const donorNameVal = isAnonymous ? "বেনামী" : (name || (savedUserObj ? savedUserObj.name : "") || "অজানা দাতা").trim();

    // Save donation to localStorage
    if (savedUserObj) {
      // Logged in user
      if (!savedUserObj.bloodGroup && bloodGroup) {
        savedUserObj.bloodGroup = bloodGroup;
      }
      if (!savedUserObj.phone && phone) {
        savedUserObj.phone = phone;
      }
      
      const newDonation = {
        amount: donationAmount,
        date: banglaDate,
        method: paymentMethodName,
        transactionId: transactionId,
        senderPhone: senderPhone,
        status: "pending"
      };
      
      savedUserObj.donations = [newDonation, ...(savedUserObj.donations || [])];
      // Recalculate total donation strictly from approved donations only
      const approvedDons = (savedUserObj.donations || []).filter((d: any) => d.status === "approved");
      savedUserObj.totalDonation = approvedDons.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
      savedUserObj.donationCount = approvedDons.length;
      
      localStorage.setItem("userData", JSON.stringify(savedUserObj));

      // Also sync to allUsers list
      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const userIdx = allUsers.findIndex((u: any) => 
        (u.phone && u.phone === savedUserObj.phone) || 
        (u.email && u.email !== "-" && u.email === savedUserObj.email) ||
        (u.name && u.name === savedUserObj.name)
      );
      if (userIdx !== -1) {
        allUsers[userIdx] = { ...allUsers[userIdx], ...savedUserObj };
      } else {
        allUsers.push(savedUserObj);
      }
      localStorage.setItem("allUsers", JSON.stringify(allUsers));
      saveAllUsersToDb(allUsers);
      
      addPendingDonationToDb({
        amount: donationAmount,
        date: banglaDate,
        method: paymentMethodName,
        transactionId: transactionId,
        senderPhone: senderPhone,
        donorName: donorNameVal,
        donorPhone: donorPhoneVal,
        donorBloodGroup: donorBloodGroupVal,
        donorEmail: savedUserObj.email || "",
        status: "pending"
      });
    } else {
      addPendingDonationToDb({
        amount: donationAmount,
        date: banglaDate,
        method: paymentMethodName,
        transactionId: transactionId,
        senderPhone: senderPhone,
        donorName: donorNameVal,
        donorPhone: donorPhoneVal,
        donorBloodGroup: donorBloodGroupVal,
        status: "pending"
      });
    }
    
    setSubmitSuccess(true);
    
    // Reset after success
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowTransactionInput(false);
      setTransactionId("");
      setSenderPhone("");
      setAmount("");
      setCustomAmount("");
      setPaymentMethod("");
      setName("");
      setPhone("");
      setBloodGroup("");
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">💝 ডোনেশন ফর্ম</h2>
      
      {/* Amount Selection */}
      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-3">টাকার পরিমাণ নির্বাচন করুন</label>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {predefinedAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => { setAmount(String(amt)); setCustomAmount(""); }}
              className={`py-3 px-4 rounded-lg font-bold transition-all ${
                amount === String(amt)
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-100"
              }`}
            >
              ৳ {amt.toLocaleString('bn-BD')}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
          <input
            type="number"
            placeholder="অন্য পরিমাণ লিখুন"
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-1">
          পেমেন্ট মাধ্যম নির্বাচন করুন 
          <span className="text-red-500 font-normal ml-2">(পার্সোনাল নাম্বার - সেন্ড মানি করুন)</span>
        </label>
        <p className="text-sm text-gray-500 mb-3">নিচের যেকোনো একটি নাম্বারে সেন্ড মানি করুন</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setPaymentMethod(method.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === method.id
                  ? `${method.color} shadow-lg scale-105 border-2`
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 relative flex items-center justify-center">
                  <img 
                    src={`/${method.id}.png`} 
                    alt={method.name}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800 text-lg">{method.name}</p>
                  <p className="text-blue-600 font-bold text-lg">{method.number}</p>
                </div>
                {paymentMethod === method.id && (
                  <span className="text-green-500 text-xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Donor Info */}
      <div className="mb-6">
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <span className="text-gray-700">বেনামে দান করতে চাই</span>
        </label>
        
        {!isAnonymous && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="আপনার নাম"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              required={!isAnonymous}
            />
            <input
              type="tel"
              placeholder="মোবাইল নম্বর"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              required
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
        )}
      </div>

      {/* Transaction ID Input - Shows after clicking donate button */}
      {showTransactionInput && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
          <div className="text-center mb-4">
            <span className="text-3xl">📱</span>
            <h3 className="font-bold text-lg text-gray-800 mt-2">পেমেন্ট সম্পন্ন করুন</h3>
            <p className="text-gray-600 text-sm">
              {paymentMethods.find(p => p.id === paymentMethod)?.name} এ <strong>01601236232</strong> নম্বরে 
              <strong className="text-green-600"> ৳{customAmount || amount}</strong> টাকা সেন্ড মানি করুন
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                যে নম্বর থেকে টাকা পাঠিয়েছেন <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="যেমন: 01712345678"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center text-lg"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                ট্রান্সজেকশন আইডি <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: TXN123456789"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-center font-mono text-lg"
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                সেন্ড মানি করার পর প্রাপ্ত ট্রান্সজেকশন আইডি এখানে লিখুন
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 border-2 border-green-400 rounded-xl text-center">
          <span className="text-4xl">✅</span>
          <h3 className="font-bold text-lg text-green-700 mt-2">ধন্যবাদ!</h3>
          <p className="text-green-600">আপনার দান সফলভাবে জমা হয়েছে। আমরা শীঘ্রই যাচাই করব।</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={(!amount && !customAmount) || !paymentMethod || submitSuccess}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        {showTransactionInput ? "দান নিশ্চিত করুন ✓" : "এখনই দান করুন 💝"}
      </button>

      <p className="text-center text-gray-500 text-sm mt-4">
        আপনার দান সম্পূর্ণ নিরাপদ এবং সুরক্ষিত
      </p>
    </form>
  );
}
