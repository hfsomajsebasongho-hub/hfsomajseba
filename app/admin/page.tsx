"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DonationRecord {
  amount: number;
  date: string;
  method: string;
  transactionId?: string;
  senderPhone?: string;
  status?: string;
  receipt?: any;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  bloodGroup: string;
  totalDonation: number;
  donationCount: number;
  joinDate: string;
  donations?: DonationRecord[];
}

interface PendingDonation {
  donorName: string;
  donorPhone: string;
  amount: number;
  date: string;
  method: string;
  transactionId: string;
  senderPhone?: string;
  donorBloodGroup: string;
  donorEmail?: string;
  status?: string;
}

interface PendingUser {
  name: string;
  email: string;
  phone: string;
  address?: string;
  bloodGroup: string;
  registrationDate: string;
  status: "pending" | "approved" | "rejected";
}

interface LedgerEntry {
  id?: string;
  timestamp?: number;
  date: string;
  donorName: string;
  phone: string;
  method: string;
  type: "income" | "expense";
  incomeAmount: number;
  expenseAmount: number;
  remarks: string;
  isCustom?: boolean;
}

export default function AdminPanel() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [pendingDonations, setPendingDonations] = useState<PendingDonation[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [manualDonationUser, setManualDonationUser] = useState<UserData | null>(null);
  const [manualDonationAmount, setManualDonationAmount] = useState("");
  const [manualDonationDate, setManualDonationDate] = useState("");
  const [manualDonationMethod, setManualDonationMethod] = useState("নগদ");

  // Manual Member Entry State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserAddress, setNewUserAddress] = useState("");
  const [newUserBloodGroup, setNewUserBloodGroup] = useState("");
  const [newUserJoinDate, setNewUserJoinDate] = useState("");
  const [addUserError, setAddUserError] = useState("");
  
  // Custom Ledger Modal state (আয়/ব্যয় এন্ট্রি)
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerType, setLedgerType] = useState<"income" | "expense">("income");
  const [ledgerName, setLedgerName] = useState("");
  const [ledgerPhone, setLedgerPhone] = useState("");
  const [ledgerMethod, setLedgerMethod] = useState("নগদ");
  const [ledgerAmount, setLedgerAmount] = useState("");
  const [ledgerDate, setLedgerDate] = useState("");
  const [ledgerRemarks, setLedgerRemarks] = useState("");

  // Donations filter state
  const [allDonations, setAllDonations] = useState<LedgerEntry[]>([]);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Edit Ledger Item state
  const [editingLedgerItem, setEditingLedgerItem] = useState<LedgerEntry | null>(null);
  const [editLedgerName, setEditLedgerName] = useState("");
  const [editLedgerPhone, setEditLedgerPhone] = useState("");
  const [editLedgerMethod, setEditLedgerMethod] = useState("নগদ");
  const [editLedgerAmount, setEditLedgerAmount] = useState("");
  const [editLedgerType, setEditLedgerType] = useState<"income" | "expense">("income");
  const [editLedgerDate, setEditLedgerDate] = useState("");
  const [editLedgerRemarks, setEditLedgerRemarks] = useState("");
  
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    totalAmount: 0,
    totalDonations: 0,
    pendingDonations: 0,
  });

  // Change Password & Auth State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loggedInAdminUser, setLoggedInAdminUser] = useState("");

  // Password visibility states
  const [showAdminLoginPassword, setShowAdminLoginPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const DEFAULT_ADMIN_ACCOUNTS = [
    { username: "admin", password: "129430" },
    { username: "admin", password: "13579" },
    { username: "admin", password: "123456" },
    { username: "admin", password: "admin@123" },
    { username: "mdtarek48", password: "112233" },
  ];

  // Helper to secure credentials stored in LocalStorage from plain-text DevTools/Inspect viewing
  const encodeSecret = (str: string) => {
    try {
      return btoa(encodeURIComponent(str));
    } catch {
      return str;
    }
  };

  const decodeSecret = (str: string) => {
    try {
      return decodeURIComponent(atob(str));
    } catch {
      return str;
    }
  };

  const getAdminAccounts = () => {
    const accounts: { username: string; password: string }[] = [...DEFAULT_ADMIN_ACCOUNTS];
    if (typeof window === "undefined") return accounts;

    const saved = localStorage.getItem("adminAccounts_sec");
    if (saved) {
      try {
        const decoded = decodeSecret(saved);
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((savedAcc: { username: string; password: string }) => {
            if (savedAcc && savedAcc.username && savedAcc.password) {
              const exists = accounts.some(
                acc => acc.username.toLowerCase() === savedAcc.username.toLowerCase() && acc.password === savedAcc.password
              );
              if (!exists) {
                accounts.push(savedAcc);
              }
            }
          });
        }
      } catch (e) {
        // Fallback to default
      }
    }
    // Remove legacy unencrypted adminAccounts key
    localStorage.removeItem("adminAccounts");
    return accounts;
  };

  // Check admin login status on component mount
  useEffect(() => {
    const checkAdminLoginStatus = () => {
      localStorage.removeItem("adminAccounts");
      const savedAdminLoginStatus = localStorage.getItem("isAdminLoggedIn");
      if (savedAdminLoginStatus === "true") {
        setIsAdminLoggedIn(true);
        const savedUser = localStorage.getItem("adminUsername") || "admin";
        setLoggedInAdminUser(savedUser);
        loadAllData();
      }
    };

    checkAdminLoginStatus();

    // Check URL parameters and custom events
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "all-donations") {
        setActiveTab("all-donations");
      }
      if (params.get("openPasswordModal") === "true") {
        setPasswordError("");
        setPasswordSuccess("");
        setCurrentPasswordInput("");
        setNewPasswordInput("");
        setConfirmPasswordInput("");
        setShowPasswordModal(true);
        // Clean up URL parameter
        const newUrl = window.location.pathname + (params.get("tab") ? `?tab=${params.get("tab")}` : "");
        window.history.replaceState({}, document.title, newUrl);
      }
    }

    const handleOpenPasswordModalEvent = () => {
      setPasswordError("");
      setPasswordSuccess("");
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
      setShowPasswordModal(true);
    };

    window.addEventListener("openAdminPasswordModal", handleOpenPasswordModalEvent);

    // Check admin login status when window gets focus
    window.addEventListener("focus", checkAdminLoginStatus);
    return () => {
      window.removeEventListener("focus", checkAdminLoginStatus);
      window.removeEventListener("openAdminPasswordModal", handleOpenPasswordModalEvent);
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

    const inputUser = adminUsername.trim().toLowerCase();
    const currentAccounts = getAdminAccounts();
    const matchedAdmin = currentAccounts.find(
      (acc: { username: string; password: string }) =>
        acc.username.toLowerCase() === inputUser && acc.password === adminPassword
    );

    if (matchedAdmin) {
      setIsAdminLoggedIn(true);
      setLoggedInAdminUser(matchedAdmin.username);
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("adminUsername", matchedAdmin.username);
      setAdminUsername("");
      setAdminPassword("");
      loadAllData();
    } else {
      setLoginError("ইউজার নেম বা পাসওয়ার্ড ভুল");
    }
  };

  // Handle Password Change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPasswordInput) {
      setPasswordError("বর্তমান পাসওয়ার্ড দিন");
      return;
    }

    if (!newPasswordInput) {
      setPasswordError("নতুন পাসওয়ার্ড দিন");
      return;
    }

    if (newPasswordInput.length < 4) {
      setPasswordError("নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে");
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError("নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না");
      return;
    }

    const currentAccounts = getAdminAccounts();
    const activeUsername = loggedInAdminUser || localStorage.getItem("adminUsername") || "admin";
    
    let accountIndex = currentAccounts.findIndex(
      (acc: { username: string; password: string }) => acc.username.toLowerCase() === activeUsername.toLowerCase()
    );

    if (accountIndex === -1) {
      accountIndex = currentAccounts.findIndex(
        (acc: { username: string; password: string }) => acc.password === currentPasswordInput
      );
    }

    if (accountIndex !== -1) {
      if (currentAccounts[accountIndex].password !== currentPasswordInput) {
        setPasswordError("বর্তমান পাসওয়ার্ডটি সঠিক নয়");
        return;
      }
      currentAccounts[accountIndex].password = newPasswordInput;
    } else {
      currentAccounts.push({ username: activeUsername, password: newPasswordInput });
    }

    localStorage.setItem("adminAccounts_sec", encodeSecret(JSON.stringify(currentAccounts)));
    localStorage.removeItem("adminAccounts");
    
    setPasswordSuccess("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!");
    setTimeout(() => {
      setShowPasswordModal(false);
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
      setPasswordSuccess("");
    }, 1500);
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    if (window.confirm("আপনি কি এডমিন প্যানেল থেকে লগআউট করতে চান?")) {
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("adminUsername");
      setIsAdminLoggedIn(false);
      setLoggedInAdminUser("");
    }
  };

  // Helper to parse Bengali date string or ID to numeric timestamp for accurate sorting
  const parseBengaliDateToTimestamp = (dateStr?: string, id?: string): number => {
    if (id) {
      const match = id.match(/\d{10,}/);
      if (match) return Number(match[0]);
    }
    if (!dateStr) return 0;

    const banglaDigits: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    let englishStr = dateStr.replace(/[০-৯]/g, (w) => banglaDigits[w]);

    const monthsMap: Record<string, string> = {
      'জানুয়ারি': 'January', 'জানুয়ারী': 'January',
      'ফেব্রুয়ারি': 'February', 'ফেব্রুয়ারী': 'February',
      'মার্চ': 'March',
      'এপ্রিল': 'April',
      'মে': 'May',
      'জুন': 'June',
      'জুলাই': 'July',
      'আগস্ট': 'August',
      'সেপ্টেম্বর': 'September',
      'অক্টোবর': 'October',
      'নভেম্বর': 'November',
      'ডিসেম্বর': 'December'
    };

    Object.entries(monthsMap).forEach(([bn, en]) => {
      englishStr = englishStr.replace(bn, en);
    });

    const parsed = new Date(englishStr).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  // Load all data from localStorage
  const loadAllData = () => {
    // Auto-seed sample donation ledger and members if empty on fresh browser/device
    if (typeof window !== "undefined" && localStorage.getItem("hasInitializedData") !== "true") {
      let customEntries = JSON.parse(localStorage.getItem("customLedgerEntries") || "[]");
      let currentUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");

      if (customEntries.length === 0) {
        const todayDate = new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
        customEntries = [
          {
            id: "init-1",
            timestamp: Date.now() - 86400000,
            date: todayDate,
            donorName: "মোঃ রফিকুল ইসলাম",
            phone: "01711223344",
            method: "বিকাশ",
            type: "income",
            incomeAmount: 5000,
            expenseAmount: 0,
            remarks: "মাসিক সাধারণ অনুদান",
            isCustom: true,
          },
          {
            id: "init-2",
            timestamp: Date.now() - 86400000 * 3,
            date: "১৫ মে ২০২৬",
            donorName: "অফিস সামগ্রী ক্রয়",
            phone: "-",
            method: "নগদ",
            type: "expense",
            incomeAmount: 0,
            expenseAmount: 1500,
            remarks: "খাতা ও কলম খরিদ",
            isCustom: true,
          },
          {
            id: "init-3",
            timestamp: Date.now() - 86400000 * 6,
            date: "১০ মে ২০২৬",
            donorName: "আব্দুল করিম",
            phone: "01812345678",
            method: "নগদ",
            type: "income",
            incomeAmount: 10000,
            expenseAmount: 0,
            remarks: "এককালীন বিশেষ দান",
            isCustom: true,
          }
        ];
        localStorage.setItem("customLedgerEntries", JSON.stringify(customEntries));
      }

      if (currentUsers.length === 0) {
        currentUsers = [
          {
            name: "মোঃ রফিকুল ইসলাম",
            email: "rafiq@gmail.com",
            phone: "01711223344",
            address: "ধানমন্ডি, ঢাকা",
            bloodGroup: "O+",
            totalDonation: 5000,
            donationCount: 1,
            joinDate: "১ মে ২০২৬",
            donations: [
              {
                amount: 5000,
                date: "২৫ মে ২০২৬",
                method: "বিকাশ",
                transactionId: "TRX-101",
                status: "approved"
              }
            ]
          },
          {
            name: "আব্দুল করিম",
            email: "karim@gmail.com",
            phone: "01812345678",
            address: "মিরপুর, ঢাকা",
            bloodGroup: "B+",
            totalDonation: 10000,
            donationCount: 1,
            joinDate: "২ মে ২০২৬",
            donations: [
              {
                amount: 10000,
                date: "১০ মে ২০২৬",
                method: "নগদ",
                transactionId: "TRX-102",
                status: "approved"
              }
            ]
          }
        ];
        localStorage.setItem("allUsers", JSON.stringify(currentUsers));
      }

      localStorage.setItem("hasInitializedData", "true");
    }

    // Load all users from allUsers
    let allUsersData: UserData[] = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const pendingUsersList: PendingUser[] = JSON.parse(localStorage.getItem("pendingUsers") || "[]");
    const savedUserStr = localStorage.getItem("userData");
    const savedUserObj = savedUserStr ? JSON.parse(savedUserStr) : null;
    
    // Deduplicate users safely and sync missing address
    const uniqueUsers: UserData[] = Array.from(
      new Map(
        allUsersData.map((user: UserData, idx: number) => {
          let userAddr = user.address && user.address !== "-" ? user.address : "";
          if (!userAddr) {
            const matchPending = pendingUsersList.find(p => (p.phone && p.phone === user.phone) || (p.email && p.email === user.email));
            if (matchPending && matchPending.address) {
              userAddr = matchPending.address;
            } else if (savedUserObj && (savedUserObj.phone === user.phone || savedUserObj.email === user.email) && savedUserObj.address) {
              userAddr = savedUserObj.address;
            }
          }
          const updatedUser: UserData = { ...user, address: userAddr || "-" };
          const key = (user.phone && user.phone !== "-") 
            ? user.phone 
            : ((user.email && user.email !== "-") 
                ? user.email 
                : `user-${idx}-${user.name}`);
          return [key, updatedUser];
        })
      ).values()
    ) as UserData[];
    
    setAllUsers(uniqueUsers);

    // Load pending donations
    const pendingDonationsData = JSON.parse(localStorage.getItem("pendingDonations") || "[]");
    setPendingDonations(pendingDonationsData);

    setPendingUsers(pendingUsersList);

    // Collect ONLY APPROVED donations & ledger entries (Income & Expense)
    const combinedLedger: LedgerEntry[] = [];
    const processedIds = new Set<string>();

    // 1. Custom entries (Custom Income & Expense added by admin or approved from pending)
    const customEntries = JSON.parse(localStorage.getItem("customLedgerEntries") || "[]");
    customEntries.forEach((ce: any) => {
      let cleanRemarks = ce.remarks || "-";
      if (typeof cleanRemarks === "string") {
        cleanRemarks = cleanRemarks.replace(/\s*\(TrxID:.*?\)/gi, "").trim();
      }

      const entryId = ce.id || `custom-${ce.donorName}-${ce.date}-${ce.incomeAmount || ce.expenseAmount}`;
      if (!processedIds.has(entryId)) {
        processedIds.add(entryId);
        if (ce.transactionId) processedIds.add(ce.transactionId);
        combinedLedger.push({
          id: entryId,
          timestamp: ce.timestamp || parseBengaliDateToTimestamp(ce.date, entryId),
          date: ce.date || "",
          donorName: ce.donorName || "-",
          phone: ce.phone || "-",
          method: ce.method || "-",
          type: ce.type || (ce.expenseAmount > 0 ? "expense" : "income"),
          incomeAmount: Number(ce.incomeAmount) || 0,
          expenseAmount: Number(ce.expenseAmount) || 0,
          remarks: cleanRemarks || "অনুমোদিত দান",
          isCustom: true,
        });
      }
    });

    // 2. Approved User donations from allUsers & userData
    const allUsersToScan = [...uniqueUsers];
    if (savedUserObj && !allUsersToScan.some(u => (u.phone && u.phone === savedUserObj.phone) || (u.email && u.email !== "-" && u.email === savedUserObj.email))) {
      allUsersToScan.push(savedUserObj);
    }

    allUsersToScan.forEach((user: UserData) => {
      if (user.donations && Array.isArray(user.donations)) {
        user.donations.forEach((donation: DonationRecord) => {
          if (donation.status === "approved") {
            const txId = donation.transactionId || `approved-${user.phone || user.name}-${donation.date}-${donation.amount}`;
            const ledgerId = `ledger-appr-${txId}`;
            if (!processedIds.has(txId) && !processedIds.has(ledgerId)) {
              processedIds.add(txId);
              processedIds.add(ledgerId);
              combinedLedger.push({
                id: txId,
                timestamp: (donation as any).timestamp || parseBengaliDateToTimestamp(donation.date, txId),
                date: donation.date || "",
                donorName: user.name || "অজানা",
                phone: user.phone || "-",
                method: donation.method || "অন্যান্য",
                type: "income",
                incomeAmount: Number(donation.amount) || 0,
                expenseAmount: 0,
                remarks: "অনুমোদিত দান",
                isCustom: false,
              });
            }
          }
        });
      }
    });

    // Sort by timestamp & date (newest entries always first at the top)
    combinedLedger.sort((a, b) => {
      const timeA = a.timestamp || parseBengaliDateToTimestamp(a.date, a.id);
      const timeB = b.timestamp || parseBengaliDateToTimestamp(b.date, b.id);
      return timeB - timeA;
    });

    setAllDonations(combinedLedger);

    // Calculate total stats from combined ledger
    const computedTotalIncome = combinedLedger
      .filter(item => item.type === "income")
      .reduce((sum, item) => sum + item.incomeAmount, 0);

    const computedTotalDonations = combinedLedger
      .filter(item => item.type === "income").length;

    setTotalStats({
      totalUsers: uniqueUsers.length,
      totalAmount: computedTotalIncome,
      totalDonations: computedTotalDonations,
      pendingDonations: pendingDonationsData.length,
    });
  };

  // Save custom income/expense ledger entry
  const saveCustomLedgerEntry = () => {
    if (!ledgerName.trim()) {
      alert("দাতার নাম বা বিবরণ দিন");
      return;
    }

    if (!ledgerAmount || Number(ledgerAmount) <= 0) {
      alert("সঠিক টাকা পরিমাণ দিন");
      return;
    }

    const amountNum = Number(ledgerAmount);
    let dateStr = "";
    if (ledgerDate) {
      const dateObj = new Date(ledgerDate);
      dateStr = dateObj.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else {
      dateStr = new Date().toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    const newEntry = {
      id: "custom-" + Date.now(),
      timestamp: Date.now(),
      date: dateStr,
      donorName: ledgerName.trim(),
      phone: ledgerPhone.trim() || "-",
      method: ledgerMethod,
      type: ledgerType,
      incomeAmount: ledgerType === "income" ? amountNum : 0,
      expenseAmount: ledgerType === "expense" ? amountNum : 0,
      remarks: ledgerRemarks.trim() || (ledgerType === "income" ? "ম্যানুয়াল আয়" : "ম্যানুয়াল ব্যয়"),
      isCustom: true,
    };

    const existing = JSON.parse(localStorage.getItem("customLedgerEntries") || "[]");
    existing.push(newEntry);
    localStorage.setItem("customLedgerEntries", JSON.stringify(existing));

    setShowLedgerModal(false);
    setLedgerName("");
    setLedgerPhone("");
    setLedgerAmount("");
    setLedgerDate("");
    setLedgerRemarks("");
    loadAllData();
    alert("আয়/ব্যয় হিসাব এন্ট্রি সফলভাবে সংরক্ষণ করা হয়েছে");
  };

  // Delete any ledger item (custom or approved user donation)
  const deleteLedgerItem = (item: LedgerEntry) => {
    if (!item.id) return;
    if (window.confirm(`আপনি কি "${item.donorName}"-এর এই হিসাবের এন্ট্রিটি মুছে ফেলতে চান?`)) {
      // 1. Remove from customLedgerEntries if present
      const customEntries = JSON.parse(localStorage.getItem("customLedgerEntries") || "[]");
      const updatedCustom = customEntries.filter((ce: any) => ce.id !== item.id && (!item.id || ce.transactionId !== item.id));
      localStorage.setItem("customLedgerEntries", JSON.stringify(updatedCustom));

      // 2. Remove/update in allUsers if present
      const allUsersData: UserData[] = JSON.parse(localStorage.getItem("allUsers") || "[]");
      let updatedAllUsers = allUsersData.map((u: UserData) => {
        if (u.donations && Array.isArray(u.donations)) {
          const filteredDons = u.donations.filter((d: any) => d.transactionId !== item.id);
          const approvedDons = filteredDons.filter((d: any) => d.status === "approved");
          return {
            ...u,
            donations: filteredDons,
            totalDonation: approvedDons.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0),
            donationCount: approvedDons.length,
          };
        }
        return u;
      });
      localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));

      loadAllData();
      alert("আয়/ব্যয় হিসাবের এন্ট্রিটি সফলভাবে মুছে দেওয়া হয়েছে।");
    }
  };

  // Open Edit Ledger Modal
  const openEditLedgerModal = (item: LedgerEntry) => {
    setEditingLedgerItem(item);
    setEditLedgerName(item.donorName || "");
    setEditLedgerPhone(item.phone && item.phone !== "-" ? item.phone : "");
    setEditLedgerMethod(item.method || "নগদ");
    setEditLedgerType(item.type || (item.expenseAmount > 0 ? "expense" : "income"));
    setEditLedgerAmount(String(item.incomeAmount > 0 ? item.incomeAmount : item.expenseAmount));
    setEditLedgerRemarks(item.remarks || "");
    setEditLedgerDate(item.date || "");
  };

  // Close Edit Ledger Modal
  const closeEditLedgerModal = () => {
    setEditingLedgerItem(null);
  };

  // Save edited ledger entry
  const saveEditedLedgerItem = () => {
    if (!editingLedgerItem) return;
    if (!editLedgerName.trim()) {
      alert("নাম বা বিবরণ দিন");
      return;
    }
    if (!editLedgerAmount || Number(editLedgerAmount) <= 0) {
      alert("সঠিক টাকা পরিমাণ দিন");
      return;
    }

    const amountNum = Number(editLedgerAmount);

    const customEntries = JSON.parse(localStorage.getItem("customLedgerEntries") || "[]");
    let foundInCustom = false;

    const updatedCustom = customEntries.map((ce: any) => {
      if (ce.id === editingLedgerItem.id || (ce.transactionId && ce.transactionId === editingLedgerItem.id)) {
        foundInCustom = true;
        return {
          ...ce,
          donorName: editLedgerName.trim(),
          phone: editLedgerPhone.trim() || "-",
          method: editLedgerMethod,
          type: editLedgerType,
          incomeAmount: editLedgerType === "income" ? amountNum : 0,
          expenseAmount: editLedgerType === "expense" ? amountNum : 0,
          remarks: editLedgerRemarks.trim() || (editLedgerType === "income" ? "আয়" : "ব্যয়"),
          date: editLedgerDate.trim() || ce.date,
        };
      }
      return ce;
    });

    if (!foundInCustom) {
      updatedCustom.push({
        id: editingLedgerItem.id,
        timestamp: Date.now(),
        date: editLedgerDate.trim() || editingLedgerItem.date,
        donorName: editLedgerName.trim(),
        phone: editLedgerPhone.trim() || "-",
        method: editLedgerMethod,
        type: editLedgerType,
        incomeAmount: editLedgerType === "income" ? amountNum : 0,
        expenseAmount: editLedgerType === "expense" ? amountNum : 0,
        remarks: editLedgerRemarks.trim() || (editLedgerType === "income" ? "আয়" : "ব্যয়"),
        isCustom: true,
      });
    }

    localStorage.setItem("customLedgerEntries", JSON.stringify(updatedCustom));

    closeEditLedgerModal();
    loadAllData();
    alert("আয়/ব্যয় হিসাব এন্ট্রি সফলভাবে আপডেট করা হয়েছে");
  };

  // Approve pending user
  const approvePendingUser = (email: string) => {
    if (window.confirm("এই ব্যবহারকারীকে অনুমোদন করতে চান?")) {
      const pendingUser = pendingUsers.find(u => u.email === email);
      if (!pendingUser) return;

      const allUsersData = JSON.parse(localStorage.getItem("allUsers") || "[]");
      
      const approvedUser = {
        name: pendingUser.name,
        email: pendingUser.email,
        phone: pendingUser.phone,
        address: pendingUser.address || "-",
        bloodGroup: pendingUser.bloodGroup,
        joinDate: pendingUser.registrationDate,
        totalDonation: 0,
        donationCount: 0,
        donations: [],
      };
      allUsersData.push(approvedUser);
      localStorage.setItem("allUsers", JSON.stringify(allUsersData));
      setAllUsers(allUsersData);

      const updatedPendingUsers: PendingUser[] = pendingUsers.map(u =>
        u.email === email ? { ...u, status: "approved" as const } : u
      );
      localStorage.setItem("pendingUsers", JSON.stringify(updatedPendingUsers));
      setPendingUsers(updatedPendingUsers);

      alert("ব্যবহারকারী অনুমোদিত হয়েছে। এখন তিনি লগইন করতে পারবেন।");
      loadAllData();
    }
  };

  // Reject pending user
  const rejectPendingUser = (email: string) => {
    if (window.confirm("এই ব্যবহারকারীকে বাতিল করতে চান?")) {
      const updatedPendingUsers: PendingUser[] = pendingUsers.map(u =>
        u.email === email ? { ...u, status: "rejected" as const } : u
      );
      localStorage.setItem("pendingUsers", JSON.stringify(updatedPendingUsers));
      setPendingUsers(updatedPendingUsers);

      alert("ব্যবহারকারী বাতিল করা হয়েছে");
    }
  };

  // Delete user
  const deleteUser = (userKey: string) => {
    if (window.confirm("আপনি কি এই সদস্যের তথ্য মুছে ফেলতে চান?")) {
      const updatedUsers = allUsers.filter(user => user.phone !== userKey && user.email !== userKey && user.name !== userKey);
      localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
      setAllUsers(updatedUsers);
      loadAllData();
      alert("সদস্য রিমুভ করা হয়েছে");
    }
  };

  // Add Member Manually Handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError("");

    if (!newUserName.trim()) {
      setAddUserError("সদস্যের নাম আবশ্যক");
      return;
    }
    if (!newUserPhone.trim()) {
      setAddUserError("মোবাইল নাম্বার আবশ্যক");
      return;
    }

    const currentUsers: UserData[] = JSON.parse(localStorage.getItem("allUsers") || "[]");
    
    // Check if phone already exists
    const exists = currentUsers.some(
      u => u.phone && u.phone !== "-" && u.phone === newUserPhone.trim()
    );

    if (exists) {
      setAddUserError("এই মোবাইল নাম্বারে ইতিমধ্যে একজন সদস্য অন্তর্ভুক্ত রয়েছেন");
      return;
    }

    let formattedJoinDate = "";
    if (newUserJoinDate.trim()) {
      const d = new Date(newUserJoinDate.trim());
      if (!isNaN(d.getTime())) {
        formattedJoinDate = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
      } else {
        formattedJoinDate = newUserJoinDate.trim();
      }
    } else {
      formattedJoinDate = new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    const newMember: UserData = {
      name: newUserName.trim(),
      email: "-",
      phone: newUserPhone.trim(),
      address: newUserAddress.trim() || "-",
      bloodGroup: newUserBloodGroup || "-",
      totalDonation: 0,
      donationCount: 0,
      joinDate: formattedJoinDate,
      donations: []
    };

    currentUsers.push(newMember);
    localStorage.setItem("allUsers", JSON.stringify(currentUsers));
    
    // Reset form and close modal
    setNewUserName("");
    setNewUserPhone("");
    setNewUserAddress("");
    setNewUserBloodGroup("");
    setNewUserJoinDate("");
    setShowAddUserModal(false);

    loadAllData();
    alert("নতুন সদস্য ম্যানুয়ালি সফলভাবে যুক্ত করা হয়েছে!");
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
      if (!donation) return;
      
      const receiptNumber = `REC-${Date.now()}`;
      const receipt = {
        receiptNumber: receiptNumber,
        donorName: donation.donorName || "অনলাইন দাতা",
        amount: Number(donation.amount) || 0,
        paymentMethod: donation.method || "অনলাইন",
        transactionId: donation.transactionId || "",
        senderPhone: donation.senderPhone || "",
        date: donation.date || new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      };

      const donationAmount = Number(donation.amount) || 0;
      const txId = donation.transactionId || `tx-${Date.now()}`;
      const ledgerEntryId = `ledger-appr-${txId}`;

      // 1. Update in allUsersData
      const allUsersData: UserData[] = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const userIndex = allUsersData.findIndex((u: UserData) => 
        (donation.donorPhone && donation.donorPhone !== "-" && u.phone === donation.donorPhone) ||
        (donation.donorName && donation.donorName !== "অজানা" && donation.donorName !== "বেনামী" && u.name === donation.donorName)
      );
      
      if (userIndex !== -1) {
        if (!allUsersData[userIndex].donations) {
          allUsersData[userIndex].donations = [];
        }

        const existingDonationIndex = allUsersData[userIndex].donations!.findIndex((d: any) => 
          (d.transactionId && donation.transactionId && d.transactionId === donation.transactionId) ||
          (Number(d.amount) === donationAmount && d.date === donation.date && d.status === "pending")
        );

        if (existingDonationIndex !== -1) {
          allUsersData[userIndex].donations![existingDonationIndex].status = "approved";
          allUsersData[userIndex].donations![existingDonationIndex].receipt = receipt;
        } else {
          allUsersData[userIndex].donations!.push({
            amount: donationAmount,
            date: donation.date,
            method: donation.method,
            transactionId: txId,
            senderPhone: donation.senderPhone,
            status: "approved",
            receipt: receipt,
          });
        }

        const approvedDons = allUsersData[userIndex].donations!.filter(d => d.status === "approved");
        allUsersData[userIndex].totalDonation = approvedDons.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        allUsersData[userIndex].donationCount = approvedDons.length;
      } else {
        allUsersData.push({
          name: donation.donorName || "অনলাইন দাতা",
          email: donation.donorEmail || "",
          phone: donation.donorPhone || donation.senderPhone || "-",
          bloodGroup: donation.donorBloodGroup || "",
          totalDonation: donationAmount,
          donationCount: 1,
          joinDate: donation.date,
          donations: [{
            amount: donationAmount,
            date: donation.date,
            method: donation.method,
            transactionId: txId,
            senderPhone: donation.senderPhone,
            status: "approved",
            receipt: receipt,
          }],
        });
      }
      
      localStorage.setItem("allUsers", JSON.stringify(allUsersData));
      setAllUsers(allUsersData);
      
      // 2. Update currently logged-in user in userData if matching
      const savedUser = localStorage.getItem("userData");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (
          (donation.donorPhone && donation.donorPhone !== "-" && userData.phone === donation.donorPhone) ||
          (donation.donorName && donation.donorName !== "অজানা" && donation.donorName !== "বেনামী" && userData.name === donation.donorName)
        ) {
          if (!userData.donations) userData.donations = [];
          const donationIndex = userData.donations.findIndex((d: any) => 
            (d.transactionId && donation.transactionId && d.transactionId === donation.transactionId) ||
            (Number(d.amount) === donationAmount && d.date === donation.date && d.status === "pending")
          );
          if (donationIndex !== -1) {
            userData.donations[donationIndex].status = "approved";
            userData.donations[donationIndex].receipt = receipt;
          } else {
            userData.donations.push({
              amount: donationAmount,
              date: donation.date,
              method: donation.method,
              transactionId: txId,
              senderPhone: donation.senderPhone,
              status: "approved",
              receipt: receipt,
            });
          }

          const userApprovedDons = userData.donations.filter((d: any) => d.status === "approved");
          userData.totalDonation = userApprovedDons.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
          userData.donationCount = userApprovedDons.length;
          localStorage.setItem("userData", JSON.stringify(userData));
        }
      }
      
      // 3. Save entry directly to customLedgerEntries to guarantee it appears in Admin Ledger & Total Calculations
      const customEntries = JSON.parse(localStorage.getItem("customLedgerEntries") || "[]");
      const existsInCustom = customEntries.some((ce: any) => ce.id === ledgerEntryId || (ce.transactionId && ce.transactionId === txId));
      if (!existsInCustom) {
        customEntries.push({
          id: ledgerEntryId,
          transactionId: txId,
          timestamp: Date.now(),
          date: donation.date || new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
          donorName: donation.donorName || "অনলাইন দাতা",
          phone: donation.donorPhone || donation.senderPhone || "-",
          method: donation.method || "অনলাইন",
          type: "income",
          incomeAmount: donationAmount,
          expenseAmount: 0,
          remarks: "অনুমোদিত দান",
          isCustom: true,
        });
        localStorage.setItem("customLedgerEntries", JSON.stringify(customEntries));
      }

      // 4. Remove from pendingDonations
      deletePendingDonation(index);
      
      // 5. Reload all data and stats immediately
      loadAllData();
      
      alert("দানটি সফলভাবে অনুমোদিত হয়েছে এবং 'দানের হিসাব (লেজার)'-এ অটোমেটিক যুক্ত হয়েছে।");
    }
  };

  // Reject pending donation
  const rejectPendingDonation = (index: number) => {
    if (window.confirm("এই দান বাতিল করতে চান?")) {
      const donation = pendingDonations[index];
      if (!donation) return;

      const donationAmount = Number(donation.amount) || 0;
      const txId = donation.transactionId || "";
      const ledgerEntryId = `ledger-appr-${txId}`;

      // 1. Remove from customLedgerEntries if present
      if (txId || ledgerEntryId) {
        const customEntries = JSON.parse(localStorage.getItem("customLedgerEntries") || "[]");
        const filteredCustom = customEntries.filter((ce: any) => ce.id !== ledgerEntryId && (!txId || ce.transactionId !== txId));
        localStorage.setItem("customLedgerEntries", JSON.stringify(filteredCustom));
      }

      // 2. Update in allUsersData
      const allUsersData: UserData[] = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const userIndex = allUsersData.findIndex((u: UserData) => 
        (donation.donorPhone && donation.donorPhone !== "-" && u.phone === donation.donorPhone) ||
        (donation.donorName && donation.donorName !== "অজানা" && donation.donorName !== "বেনামী" && u.name === donation.donorName)
      );

      if (userIndex !== -1 && allUsersData[userIndex].donations) {
        const donationIndex = allUsersData[userIndex].donations!.findIndex((d: any) => 
          (d.transactionId && txId && d.transactionId === txId) ||
          (Number(d.amount) === donationAmount && d.date === donation.date && d.status === "pending")
        );
        if (donationIndex !== -1) {
          allUsersData[userIndex].donations![donationIndex].status = "rejected";
        }
        const approvedDons = allUsersData[userIndex].donations!.filter(d => d.status === "approved");
        allUsersData[userIndex].totalDonation = approvedDons.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        allUsersData[userIndex].donationCount = approvedDons.length;

        localStorage.setItem("allUsers", JSON.stringify(allUsersData));
        setAllUsers(allUsersData);
      }
      
      // 3. Update currently logged-in user if matches
      const savedUser = localStorage.getItem("userData");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (
          (donation.donorPhone && donation.donorPhone !== "-" && userData.phone === donation.donorPhone) ||
          (donation.donorName && donation.donorName !== "অজানা" && donation.donorName !== "বেনামী" && userData.name === donation.donorName)
        ) {
          if (userData.donations && Array.isArray(userData.donations)) {
            const donationIndex = userData.donations.findIndex((d: any) => 
              (d.transactionId && txId && d.transactionId === txId) ||
              (Number(d.amount) === donationAmount && d.date === donation.date && d.status === "pending")
            );
            if (donationIndex !== -1) {
              userData.donations[donationIndex].status = "rejected";
            }
            const userApprovedDons = userData.donations.filter((d: any) => d.status === "approved");
            userData.totalDonation = userApprovedDons.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
            userData.donationCount = userApprovedDons.length;
            localStorage.setItem("userData", JSON.stringify(userData));
          }
        }
      }
      
      // 4. Remove from pendingDonations
      deletePendingDonation(index);

      // 5. Reload all data and stats immediately
      loadAllData();

      alert("দানটি বাতিল করা হয়েছে এবং এটি দানের হিসাবে যুক্ত হয়নি।");
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

    const newDonationObj = {
      amount: amount,
      date: banglaDate,
      method: manualDonationMethod,
      transactionId: "MANUAL-" + Date.now(),
      status: "approved"
    };

    const updatedUsers = allUsers.map(user => {
      if (user.phone === manualDonationUser.phone || user.name === manualDonationUser.name) {
        const existingDonations = user.donations || [];
        return {
          ...user,
          totalDonation: (user.totalDonation || 0) + amount,
          donationCount: (user.donationCount || 0) + 1,
          donations: [newDonationObj, ...existingDonations],
        };
      }
      return user;
    });

    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);

    const savedUser = localStorage.getItem("userData");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.phone === manualDonationUser.phone || userData.name === manualDonationUser.name) {
        userData.donations = [newDonationObj, ...(userData.donations || [])];
        userData.totalDonation = (userData.totalDonation || 0) + amount;
        userData.donationCount = (userData.donationCount || 0) + 1;
        localStorage.setItem("userData", JSON.stringify(userData));
      }
    }

    closeManualDonationModal();
    loadAllData();
    alert("ম্যানুয়াল দান সংরক্ষণ করা হয়েছে এবং 'দানের হিসাব'-এ যোগ হয়েছে");
  };

  // Open edit modal
  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditAddress(user.address || "");
    setEditBloodGroup(user.bloodGroup);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingUser(null);
    setEditName("");
    setEditPhone("");
    setEditAddress("");
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
      (user.phone === editingUser.phone || user.email === editingUser.email)
        ? {
            ...user,
            name: editName,
            phone: editPhone,
            address: editAddress,
            bloodGroup: editBloodGroup,
          }
        : user
    );

    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    closeEditModal();
    alert("সদস্য তথ্য আপডেট করা হয়েছে");
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

  // Export donations ledger to Excel (CSV with UTF-8 BOM for Excel Bengali font support)
  const downloadExcel = () => {
    if (allDonations.length === 0) {
      alert("ডাউনলোড করার মতো কোনো হিসাব পাওয়া যায়নি");
      return;
    }

    const filteredLedger = allDonations.filter((item) => {
      if (!item.date) return true;
      const dateStr = item.date;
      const numbers = dateStr.match(/\d+/g) || [];
      const day = numbers[0] || '';
      const year = numbers[1] || '';
      
      if (filterYear && year !== filterYear) return false;
      if (filterDay && day !== filterDay) return false;
      
      if (filterMonth) {
        const months: Record<string, string[]> = {
          'January': ['January', 'জানুয়ারি'],
          'February': ['February', 'ফেব্রুয়ারি'],
          'March': ['March', 'মার্চ'],
          'April': ['April', 'এপ্রিল'],
          'May': ['May', 'মে'],
          'June': ['June', 'জুন'],
          'July': ['July', 'জুলাই'],
          'August': ['August', 'আগস্ট'],
          'September': ['September', 'সেপ্টেম্বর'],
          'October': ['October', 'অক্টোবর'],
          'November': ['November', 'নভেম্বর'],
          'December': ['December', 'ডিসেম্বর']
        };
        if (!months[filterMonth]?.some((m: string) => dateStr.includes(m))) {
          return false;
        }
      }
      return true;
    });

    if (filteredLedger.length === 0) {
      alert("নির্বাচিত ফিল্টারে কোনো হিসাব পাওয়া যায়নি");
      return;
    }

    const headers = ["তারিখ", "দাতার নাম / বিবরণ", "মোবাইল নাম্বার", "পেমেন্ট পদ্ধতি", "আয় (৳)", "ব্যয় (৳)", "রিমার্কস"];

    let totalInc = 0;
    let totalExp = 0;

    const rows = filteredLedger.map((item) => {
      const inc = item.incomeAmount || 0;
      const exp = item.expenseAmount || 0;
      totalInc += inc;
      totalExp += exp;

      const date = `"${(item.date || "").replace(/"/g, '""')}"`;
      const name = `"${(item.donorName || "").replace(/"/g, '""')}"`;
      const phone = `"${(item.phone || "-").replace(/"/g, '""')}"`;
      const method = `"${(item.method || "-").replace(/"/g, '""')}"`;
      const remarks = `"${(item.remarks || "-").replace(/"/g, '""')}"`;

      return [date, name, phone, method, inc > 0 ? inc : 0, exp > 0 ? exp : 0, remarks].join(",");
    });

    const netBal = totalInc - totalExp;
    const totalsRow = [
      '"সর্বমোট হিসাব"',
      '""',
      '""',
      '""',
      totalInc,
      totalExp,
      `"অবশিষ্ট জের: ৳ ${netBal}"`
    ].join(",");

    const csvContent = "\uFEFF" + [headers.join(","), ...rows, totalsRow].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `donations_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export donations ledger to PDF / Print Report directly to device
  const downloadPDF = async () => {
    if (allDonations.length === 0) {
      alert("ডাউনলোড করার মতো কোনো হিসাব পাওয়া যায়নি");
      return;
    }

    const filteredLedger = allDonations.filter((item) => {
      if (!item.date) return true;
      const dateStr = item.date;
      const numbers = dateStr.match(/\d+/g) || [];
      const day = numbers[0] || '';
      const year = numbers[1] || '';
      
      if (filterYear && year !== filterYear) return false;
      if (filterDay && day !== filterDay) return false;
      
      if (filterMonth) {
        const months: Record<string, string[]> = {
          'January': ['January', 'জানুয়ারি'],
          'February': ['February', 'ফেব্রুয়ারি'],
          'March': ['March', 'মার্চ'],
          'April': ['April', 'এপ্রিল'],
          'May': ['May', 'মে'],
          'June': ['June', 'জুন'],
          'July': ['July', 'জুলাই'],
          'August': ['August', 'আগস্ট'],
          'September': ['September', 'সেপ্টেম্বর'],
          'October': ['October', 'অক্টোবর'],
          'November': ['November', 'নভেম্বর'],
          'December': ['December', 'ডিসেম্বর']
        };
        if (!months[filterMonth]?.some((m: string) => dateStr.includes(m))) {
          return false;
        }
      }
      return true;
    });

    if (filteredLedger.length === 0) {
      alert("নির্বাচিত ফিল্টারে কোনো হিসাব পাওয়া যায়নি");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const totalIncome = filteredLedger.reduce((sum, item) => sum + (item.incomeAmount || 0), 0);
      const totalExpense = filteredLedger.reduce((sum, item) => sum + (item.expenseAmount || 0), 0);
      const netBalance = totalIncome - totalExpense;
      const todayBn = new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

      // Load logo image as Base64 data URL for html2canvas
      let logoDataUrl = "";
      try {
        logoDataUrl = await new Promise<string>((resolve) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/png"));
            } else {
              resolve("/hf_logo.png");
            }
          };
          img.onerror = () => resolve("/hf_logo.png");
          img.src = "/hf_logo.png";
        });
      } catch (e) {
        logoDataUrl = "/hf_logo.png";
      }

      // Create printable off-screen DOM element
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "800px";
      container.style.backgroundColor = "#ffffff";
      container.style.padding = "30px";
      container.style.color = "#1f2937";
      container.style.fontFamily = "'SolaimanLipi', 'Segoe UI', Arial, sans-serif";

      const rowsHtml = filteredLedger.map((item, idx) => `
        <tr style="border-bottom: 1px solid #e5e7eb; ${idx % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
          <td style="padding: 10px; font-size: 12px; white-space: nowrap;">${item.date}</td>
          <td style="padding: 10px; font-size: 12px; font-weight: 600; color: #111827;">${item.donorName}</td>
          <td style="padding: 10px; font-size: 12px; color: #4b5563;">${item.phone || "-"}</td>
          <td style="padding: 10px; font-size: 12px;">${item.method}</td>
          <td style="padding: 10px; font-size: 12px; text-align: right; color: #16a34a; font-weight: bold; white-space: nowrap;">
            ${item.incomeAmount > 0 ? "৳ " + item.incomeAmount.toLocaleString('bn-BD') : "-"}
          </td>
          <td style="padding: 10px; font-size: 12px; text-align: right; color: #dc2626; font-weight: bold; white-space: nowrap;">
            ${item.expenseAmount > 0 ? "৳ " + item.expenseAmount.toLocaleString('bn-BD') : "-"}
          </td>
          <td style="padding: 10px; font-size: 11px; color: #6b7280;">${item.remarks || "-"}</td>
        </tr>
      `).join("");

      container.innerHTML = `
        <div style="text-align: center; border-bottom: 3px double #1e40af; padding-bottom: 15px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px;">
            ${logoDataUrl ? `<img src="${logoDataUrl}" style="width: 55px; height: 55px; object-fit: contain; border-radius: 50%;" />` : ''}
            <h1 style="margin: 0; color: #1e40af; font-size: 24px; font-weight: bold;">HF সমাজসেবা সংঘ</h1>
          </div>
          <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px; font-weight: 600;">আয়-ব্যয় ও দানের হিসাব (লেজার স্টেটমেন্ট)</p>
          <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">ডাউনলোডের তারিখ: ${todayBn}</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; gap: 12px;">
          <div style="flex: 1; padding: 12px; border-radius: 8px; background-color: #f0fdf4; border: 1px solid #bbf7d0; text-align: center;">
            <div style="font-size: 12px; font-weight: bold; color: #166534;">মোট আয়</div>
            <div style="font-size: 18px; font-weight: 800; color: #15803d; margin-top: 4px;">৳ ${totalIncome.toLocaleString('bn-BD')}</div>
          </div>
          <div style="flex: 1; padding: 12px; border-radius: 8px; background-color: #fef2f2; border: 1px solid #fecaca; text-align: center;">
            <div style="font-size: 12px; font-weight: bold; color: #991b1b;">মোট ব্যয়</div>
            <div style="font-size: 18px; font-weight: 800; color: #b91c1c; margin-top: 4px;">৳ ${totalExpense.toLocaleString('bn-BD')}</div>
          </div>
          <div style="flex: 1; padding: 12px; border-radius: 8px; background-color: #eff6ff; border: 1px solid #bfdbfe; text-align: center;">
            <div style="font-size: 12px; font-weight: bold; color: #1e40af;">অবশিষ্ট জের (নিট ব্যালেন্স)</div>
            <div style="font-size: 18px; font-weight: 800; color: ${netBalance < 0 ? '#dc2626' : '#047857'}; margin-top: 4px;">৳ ${netBalance.toLocaleString('bn-BD')}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #9ca3af; color: #111827;">তারিখ</th>
              <th style="padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #9ca3af; color: #111827;">দাতার নাম / বিবরণ</th>
              <th style="padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #9ca3af; color: #111827;">মোবাইল</th>
              <th style="padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #9ca3af; color: #111827;">পদ্ধতি</th>
              <th style="padding: 10px; text-align: right; font-size: 12px; border-bottom: 2px solid #9ca3af; color: #16a34a;">আয় (৳)</th>
              <th style="padding: 10px; text-align: right; font-size: 12px; border-bottom: 2px solid #9ca3af; color: #dc2626;">ব্যয় (৳)</th>
              <th style="padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #9ca3af; color: #111827;">রিমার্কস</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f3f4f6; font-weight: bold;">
              <td colspan="4" style="padding: 12px 10px; text-align: right; font-size: 13px; border-top: 2px solid #6b7280;">সর্বমোট:</td>
              <td style="padding: 12px 10px; text-align: right; font-size: 13px; color: #16a34a; border-top: 2px solid #6b7280;">৳ ${totalIncome.toLocaleString('bn-BD')}</td>
              <td style="padding: 12px 10px; text-align: right; font-size: 13px; color: #dc2626; border-top: 2px solid #6b7280;">৳ ${totalExpense.toLocaleString('bn-BD')}</td>
              <td style="padding: 12px 10px; font-size: 12px; color: #1e40af; border-top: 2px solid #6b7280;">জের: ৳ ${netBalance.toLocaleString('bn-BD')}</td>
            </tr>
          </tfoot>
        </table>
      `;

      document.body.appendChild(container);

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      // Save PDF directly onto device
      const fileName = `donations_ledger_${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("PDF তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Clear all registered users / members
  const clearAllUsersData = () => {
    if (window.confirm("আপনি কি নিশ্চিত যে সকল সদস্যের ডাটা রিমুভ করতে চান? এটি পূর্বাবস্থায় ফেরানো যাবে না।")) {
      localStorage.setItem("allUsers", "[]");
      setAllUsers([]);
      loadAllData();
      alert("সকল সদস্যের এন্ট্রি মুছে দেওয়া হয়েছে");
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-blue-800">এডমিন প্যানেল</h1>
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
                placeholder="ইউজার নেম দিন (যেমন: mdtarek48)"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showAdminLoginPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 pr-11"
                  placeholder="পাসওয়ার্ড দিন"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminLoginPassword(!showAdminLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 text-lg transition-colors p-1 cursor-pointer select-none"
                  title={showAdminLoginPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                >
                  {showAdminLoginPassword ? "👁️" : "🙈"}
                </button>
              </div>
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-800 flex items-center gap-3">
            🔐 এডমিন প্যানেল
          </h1>
          <p className="text-gray-600 mt-2">
            সিস্টেম পরিচালনা এবং তথ্য দেখুন {loggedInAdminUser && <span className="text-blue-600 font-semibold">({loggedInAdminUser})</span>}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b flex-wrap">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === "users"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              সকল সদস্য ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab("pending-users")}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === "pending-users"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              নতুন সদস্য ({pendingUsers.filter(u => u.status === "pending").length})
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
              onClick={() => {
                setActiveTab("all-donations");
                setTimeout(() => loadAllData(), 50);
              }}
              className={`flex-1 py-4 px-6 font-bold text-center transition-colors ${
                activeTab === "all-donations"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              📊 দানের হিসাব ({allDonations.length})
            </button>
          </div>

          {/* Members Tab */}
          {activeTab === "users" && (
            <div className="p-6 overflow-x-auto">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">👥 সকল সদস্যের তালিকা</h2>
                  <p className="text-xs text-gray-500 mt-0.5">সংগঠনের সকল নিবন্ধিত ও ম্যানুয়াল সদস্য</p>
                </div>
                <button
                  onClick={() => {
                    setAddUserError("");
                    setShowAddUserModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4.5 py-2.5 rounded-lg font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <span>➕</span>
                  <span>ম্যানুয়ালি সদস্য এন্ট্রি</span>
                </button>
              </div>

              {/* Summary Stats Cards */}
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-lg border border-blue-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">মোট সদস্য</p>
                    <h3 className="text-3xl font-extrabold mt-1 text-white flex items-baseline gap-1">
                      <span>{allUsers.length}</span>
                      <span className="text-sm font-normal text-blue-200">জন</span>
                    </h3>
                    <p className="text-xs text-blue-200 mt-1">সর্বমোট নিবন্ধিত সদস্য</p>
                  </div>
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20">
                    👥
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 rounded-2xl shadow-lg border border-red-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs font-bold uppercase tracking-wider">রক্তদাতা সদস্য</p>
                    <h3 className="text-3xl font-extrabold mt-1 text-white flex items-baseline gap-1">
                      <span>{allUsers.filter(u => u.bloodGroup && u.bloodGroup !== "-").length}</span>
                      <span className="text-sm font-normal text-red-200">জন</span>
                    </h3>
                    <p className="text-xs text-red-200 mt-1">রক্তের গ্রুপযুক্ত সদস্য</p>
                  </div>
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20">
                    🩸
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-lg border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">দানকারী সদস্য</p>
                    <h3 className="text-3xl font-extrabold mt-1 text-white flex items-baseline gap-1">
                      <span>{allUsers.filter(u => (u.totalDonation || 0) > 0).length}</span>
                      <span className="text-sm font-normal text-emerald-200">জন</span>
                    </h3>
                    <p className="text-xs text-emerald-200 mt-1">কমপক্ষে ১টি দান সম্পূর্ণ</p>
                  </div>
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20">
                    💚
                  </div>
                </div>
              </div>
              {allUsers.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4">নাম</th>
                      <th className="text-left py-3 px-4">মোবাইল নাম্বার</th>
                      <th className="text-left py-3 px-4">ঠিকানা</th>
                      <th className="text-left py-3 px-4">রক্তের গ্রুপ</th>
                      <th className="text-left py-3 px-4">যোগদানের তারিখ</th>
                      <th className="text-center py-3 px-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4">{user.phone}</td>
                        <td className="py-3 px-4">{user.address || "-"}</td>
                        <td className="py-3 px-4">
                          {user.bloodGroup ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                              {user.bloodGroup}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{user.joinDate || (user as any).registrationDate || "-"}</td>
                        <td className="py-3 px-4 text-center space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors cursor-pointer"
                          >
                            এডিট
                          </button>
                          <button
                            onClick={() => deleteUser(user.phone || user.email || user.name)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors cursor-pointer"
                          >
                            মুছুন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">কোনো সদস্য পাওয়া যায়নি</p>
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
                      <th className="text-left py-3 px-4">যে নাম্বার থেকে টাকা আসছে</th>
                      <th className="text-left py-3 px-4">ট্রানজ্যাকশন ID</th>
                      <th className="text-left py-3 px-4">তারিখ</th>
                      <th className="text-left py-3 px-4">স্ট্যাটাস</th>
                      <th className="text-center py-3 px-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDonations.map((donation, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{donation.donorName || "অজানা দাতা"}</td>
                        <td className="py-3 px-4">{donation.donorPhone && donation.donorPhone !== "-" ? donation.donorPhone : (donation.senderPhone || "-")}</td>
                        <td className="py-3 px-4">
                          {donation.donorBloodGroup && donation.donorBloodGroup !== "-" ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                              {donation.donorBloodGroup}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold text-green-600">৳ {donation.amount.toLocaleString('bn-BD')}</td>
                        <td className="py-3 px-4">{donation.method}</td>
                        <td className="py-3 px-4 font-bold text-blue-700">{donation.senderPhone || donation.donorPhone || "-"}</td>
                        <td className="py-3 px-4 text-sm font-mono">{donation.transactionId}</td>
                        <td className="py-3 px-4">{donation.date}</td>
                        <td className="py-3 px-4">
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                            অপেক্ষমাণ
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => approvePendingDonation(index)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                            >
                              এপ্রুভ
                            </button>
                            <button
                              onClick={() => rejectPendingDonation(index)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                            >
                              বাতিল
                            </button>
                          </div>
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

          {/* Pending Users Tab */}
          {activeTab === "pending-users" && (
            <div className="p-6 overflow-x-auto">
              {pendingUsers.filter(u => u.status === "pending").length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4">নাম</th>
                      <th className="text-left py-3 px-4">ইমেইল</th>
                      <th className="text-left py-3 px-4">মোবাইল</th>
                      <th className="text-left py-3 px-4">রক্তের গ্রুপ</th>
                      <th className="text-left py-3 px-4">নিবন্ধন তারিখ</th>
                      <th className="text-left py-3 px-4">স্ট্যাটাস</th>
                      <th className="text-center py-3 px-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.filter(u => u.status === "pending").map((user, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{user.phone}</td>
                        <td className="py-3 px-4">
                          {user.bloodGroup ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                              {user.bloodGroup}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{user.registrationDate}</td>
                        <td className="py-3 px-4">
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                            পেন্ডিং
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => approvePendingUser(user.email)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                            >
                              এপ্রুভ করুন
                            </button>
                            <button
                              onClick={() => rejectPendingUser(user.email)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                            >
                              বাতিল করুন
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-gray-500 text-lg">কোনো পেন্ডিং সদস্য নেই</p>
                  <p className="text-gray-400 text-sm mt-2">সকল নিবন্ধন অনুমোদিত হয়েছে</p>
                </div>
              )}
            </div>
          )}

          {/* All Donations / Income & Expense Ledger Tab */}
          {activeTab === "all-donations" && (
            <div className="p-6">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-800">📊 আয়-ব্যয় ও দানের হিসাব (লেজার)</h2>
                  <p className="text-gray-600 text-sm mt-1">সমস্ত আয়, দান, ব্যয় এবং অবশিষ্ট জেরে হিসেব</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={downloadExcel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg shadow transition-colors flex items-center gap-2 text-sm"
                    title="এক্সেল (Excel/CSV) ফাইল ডাউনলোড করুন"
                  >
                    <span>📊</span> Excel ডাউনলোড
                  </button>
                  <button
                    onClick={downloadPDF}
                    disabled={isGeneratingPDF}
                    className={`${
                      isGeneratingPDF ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    } text-white font-bold py-2.5 px-4 rounded-lg shadow transition-colors flex items-center gap-2 text-sm`}
                    title="PDF ডকুমেন্ট সরাসরি ডিভাইসে ডাউনলোড করুন"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <span className="animate-spin">⏳</span> PDF ফাইল তৈরি হচ্ছে...
                      </>
                    ) : (
                      <>
                        <span>📄</span> PDF ডাউনলোড
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowLedgerModal(true);
                      setLedgerType("income");
                      setLedgerName("");
                      setLedgerPhone("");
                      setLedgerAmount("");
                      setLedgerDate(new Date().toISOString().split('T')[0]);
                      setLedgerRemarks("");
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-lg shadow transition-colors flex items-center gap-2 text-sm"
                  >
                    ➕ নতুন আয়/ব্যয় এন্ট্রি
                  </button>
                </div>
              </div>

              {(() => {
                const filteredLedger = allDonations.filter((item) => {
                  if (!item.date) return true;
                  const dateStr = item.date;
                  const numbers = dateStr.match(/\d+/g) || [];
                  const day = numbers[0] || '';
                  const year = numbers[1] || '';
                  
                  if (filterYear && year !== filterYear) return false;
                  if (filterDay && day !== filterDay) return false;
                  
                  if (filterMonth) {
                    const months: Record<string, string[]> = {
                      'January': ['January', 'জানুয়ারি'],
                      'February': ['February', 'ফেব্রুয়ারি'],
                      'March': ['March', 'মার্চ'],
                      'April': ['April', 'এপ্রিল'],
                      'May': ['May', 'মে'],
                      'June': ['June', 'জুন'],
                      'July': ['July', 'জুলাই'],
                      'August': ['August', 'আগস্ট'],
                      'September': ['September', 'সেপ্টেম্বর'],
                      'October': ['October', 'অক্টোবর'],
                      'November': ['November', 'নভেম্বর'],
                      'December': ['December', 'ডিসেম্বর']
                    };
                    if (!months[filterMonth]?.some((m: string) => dateStr.includes(m))) {
                      return false;
                    }
                  }
                  return true;
                });

                const totalIncome = filteredLedger.reduce((sum, item) => sum + (item.incomeAmount || 0), 0);
                const totalExpense = filteredLedger.reduce((sum, item) => sum + (item.expenseAmount || 0), 0);
                const netBalance = totalIncome - totalExpense;

                return (
                  <div>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 shadow-sm">
                        <p className="text-green-700 font-bold text-sm">মোট আয়</p>
                        <p className="text-3xl font-extrabold text-green-700 mt-1">৳ {totalIncome.toLocaleString('bn-BD')}</p>
                      </div>
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
                        <p className="text-red-700 font-bold text-sm">মোট ব্যয়</p>
                        <p className="text-3xl font-extrabold text-red-700 mt-1">৳ {totalExpense.toLocaleString('bn-BD')}</p>
                      </div>
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
                        <p className="text-blue-800 font-bold text-sm">অবশিষ্ট জের (নিট ব্যালেন্স)</p>
                        <p className={`text-3xl font-extrabold mt-1 ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          ৳ {netBalance.toLocaleString('bn-BD')}
                        </p>
                      </div>
                    </div>

                    {/* Donations Ledger Table */}
                    {filteredLedger.length > 0 ? (
                      <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-100 border-b border-gray-200 text-gray-800">
                            <tr>
                              <th className="py-3.5 px-4 font-bold text-gray-800 border-r border-gray-200">তারিখ</th>
                              <th className="py-3.5 px-4 font-bold text-gray-800 border-r border-gray-200">দাতার নাম / বিবরণ</th>
                              <th className="py-3.5 px-4 font-bold text-gray-800 border-r border-gray-200">মোবাইল নাম্বার</th>
                              <th className="py-3.5 px-4 font-bold text-gray-800 border-r border-gray-200">পেমেন্ট পদ্ধতি</th>
                              <th className="py-3.5 px-4 font-bold text-green-700 border-r border-gray-200 text-right">আয়</th>
                              <th className="py-3.5 px-4 font-bold text-red-700 border-r border-gray-200 text-right">ব্যয়</th>
                              <th className="py-3.5 px-4 font-bold text-gray-800 border-r border-gray-200">রিমার্কস</th>
                              <th className="py-3.5 px-4 font-bold text-gray-800 text-center">অ্যাকশন</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLedger.map((item, index) => (
                              <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-gray-700 border-r border-gray-100 font-medium whitespace-nowrap">{item.date}</td>
                                <td className="py-3 px-4 text-gray-900 border-r border-gray-100 font-semibold">{item.donorName}</td>
                                <td className="py-3 px-4 text-gray-600 border-r border-gray-100 whitespace-nowrap">{item.phone || "-"}</td>
                                <td className="py-3 px-4 border-r border-gray-100">
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded font-semibold whitespace-nowrap">
                                    {item.method}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-green-600 border-r border-gray-100 whitespace-nowrap">
                                  {item.incomeAmount > 0 ? `৳ ${item.incomeAmount.toLocaleString('bn-BD')}` : "-"}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-red-600 border-r border-gray-100 whitespace-nowrap">
                                  {item.expenseAmount > 0 ? `৳ ${item.expenseAmount.toLocaleString('bn-BD')}` : "-"}
                                </td>
                                <td className="py-3 px-4 text-gray-600 text-sm border-r border-gray-100">{item.remarks || "-"}</td>
                                <td className="py-3 px-4 text-center whitespace-nowrap space-x-2">
                                  <button
                                    onClick={() => openEditLedgerModal(item)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors font-bold cursor-pointer"
                                    title="এন্ট্রি এডিট করুন"
                                  >
                                    এডিট
                                  </button>
                                  <button
                                    onClick={() => deleteLedgerItem(item)}
                                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors font-bold cursor-pointer"
                                    title="এন্ট্রি মুছে ফেলুন"
                                  >
                                    মুছুন
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                            <tr>
                              <td colSpan={4} className="py-4 px-4 text-right font-bold text-gray-800 text-base border-r border-gray-200">
                                মোট হিসাব:
                              </td>
                              <td className="py-4 px-4 text-right font-bold text-green-700 text-base border-r border-gray-200 whitespace-nowrap">
                                ৳ {totalIncome.toLocaleString('bn-BD')}
                              </td>
                              <td className="py-4 px-4 text-right font-bold text-red-700 text-base border-r border-gray-200 whitespace-nowrap">
                                ৳ {totalExpense.toLocaleString('bn-BD')}
                              </td>
                              <td colSpan={2} className="py-4 px-4 text-left font-bold text-blue-900 text-base whitespace-nowrap">
                                অবশিষ্ট জের:{" "}
                                <span className={netBalance >= 0 ? "text-emerald-700 font-extrabold" : "text-red-700 font-extrabold"}>
                                  ৳ {netBalance.toLocaleString('bn-BD')}
                                </span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <div className="text-5xl mb-3">📋</div>
                        <p className="text-gray-500 text-lg">কোনো আয়-ব্যয় হিসাব পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                );
              })()}
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
                    ঠিকানা
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    placeholder="বর্তমান ঠিকানা"
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

        {/* Edit Ledger Entry Modal */}
        {editingLedgerItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-4 px-5 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center text-lg shadow-inner border border-white/20">
                    ✏️
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      আয়/ব্যয় হিসাব এডিট করুন
                    </h3>
                    <p className="text-xs text-blue-200 mt-0.5">তথ্য পরিবর্তন করুন</p>
                  </div>
                </div>
                <button
                  onClick={closeEditLedgerModal}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">এন্ট্রি টাইপ</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditLedgerType("income")}
                      className={`py-2 px-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        editLedgerType === "income"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>💚</span> আয় (Income)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditLedgerType("expense")}
                      className={`py-2 px-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        editLedgerType === "expense"
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>❤️</span> ব্যয় (Expense)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {editLedgerType === "income" ? "দাতার নাম / বিবরণ *" : "ব্যয়ের বিবরণ / গ্রহীতার নাম *"}
                  </label>
                  <input
                    type="text"
                    value={editLedgerName}
                    onChange={(e) => setEditLedgerName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">টাকা (পরিমাণ ৳) *</label>
                    <input
                      type="number"
                      value={editLedgerAmount}
                      onChange={(e) => setEditLedgerAmount(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all font-bold text-gray-800"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">মোবাইল (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={editLedgerPhone}
                      onChange={(e) => setEditLedgerPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">পেমেন্ট পদ্ধতি</label>
                    <select
                      value={editLedgerMethod}
                      onChange={(e) => setEditLedgerMethod(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all text-gray-800"
                    >
                      <option value="নগদ">নগদ</option>
                      <option value="বিকাশ">বিকাশ</option>
                      <option value="রকেট">রকেট</option>
                      <option value="ব্যাংক">ব্যাংক</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">তারিখ</label>
                    <input
                      type="text"
                      value={editLedgerDate}
                      onChange={(e) => setEditLedgerDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all font-medium text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">রিমার্কস (মন্তব্য)</label>
                  <input
                    type="text"
                    value={editLedgerRemarks}
                    onChange={(e) => setEditLedgerRemarks(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={closeEditLedgerModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-all text-sm cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={saveEditedLedgerItem}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-600/30 transition-all text-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>💾</span>
                    <span>আপডেট করুন</span>
                  </button>
                </div>
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
        {/* Custom Ledger Modal (আয়/ব্যয় এন্ট্রি ফরম) */}
        {showLedgerModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-4 px-5 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center text-lg shadow-inner border border-white/20">
                    ➕
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      নতুন আয়/ব্যয় এন্ট্রি
                    </h3>
                    <p className="text-xs text-blue-200 mt-0.5">লেনদেনের বিস্তারিত তথ্য দিন</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="p-5 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">এন্ট্রি টাইপ</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLedgerType("income")}
                      className={`py-2 px-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        ledgerType === "income"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>💚</span> আয় (Income)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLedgerType("expense")}
                      className={`py-2 px-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        ledgerType === "expense"
                          ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>❤️</span> ব্যয় (Expense)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    {ledgerType === "income" ? "দাতার নাম / বিবরণ *" : "ব্যয়ের বিবরণ / গ্রহীতার নাম *"}
                  </label>
                  <input
                    type="text"
                    value={ledgerName}
                    onChange={(e) => setLedgerName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all"
                    placeholder={ledgerType === "income" ? "যেমন: আব্দুর রহিম" : "যেমন: অফিস সরঞ্জাম ব্যয়"}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">টাকা (পরিমাণ ৳) *</label>
                    <input
                      type="number"
                      value={ledgerAmount}
                      onChange={(e) => setLedgerAmount(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all font-bold text-gray-800"
                      placeholder="৳ ০.০০"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">মোবাইল (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={ledgerPhone}
                      onChange={(e) => setLedgerPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all"
                      placeholder="017XXXXXXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">পেমেন্ট পদ্ধতি</label>
                    <select
                      value={ledgerMethod}
                      onChange={(e) => setLedgerMethod(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all text-gray-800"
                    >
                      <option value="নগদ">নগদ</option>
                      <option value="বিকাশ">বিকাশ</option>
                      <option value="রকেট">রকেট</option>
                      <option value="ব্যাংক">ব্যাংক</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">তারিখ</label>
                    <input
                      type="date"
                      value={ledgerDate}
                      onChange={(e) => setLedgerDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all font-medium text-gray-800 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">রিমার্কস (মন্তব্য)</label>
                  <input
                    type="text"
                    value={ledgerRemarks}
                    onChange={(e) => setLedgerRemarks(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all"
                    placeholder="সংক্ষিপ্ত মন্তব্য লিখুন"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowLedgerModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-all text-sm cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={saveCustomLedgerEntry}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-600/30 transition-all text-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>💾</span>
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 flex justify-between items-center relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/20">
                    👤
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      নতুন সদস্য ম্যানুয়াল এন্ট্রি
                    </h3>
                    <p className="text-xs text-blue-200 mt-0.5">সদস্যের সঠিক তথ্য দিন</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleAddUser} className="space-y-4">
                  {addUserError && (
                    <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm border border-red-200 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{addUserError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>সদস্যের নাম</span>
                      <span className="text-red-500 text-xs">*আবশ্যক</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                        className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>মোবাইল নাম্বার</span>
                      <span className="text-red-500 text-xs">*আবশ্যক</span>
                    </label>
                    <input
                      type="text"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="যেমন: 01700000000"
                      className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all font-medium text-gray-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      ঠিকানা (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={newUserAddress}
                      onChange={(e) => setNewUserAddress(e.target.value)}
                      placeholder="যেমন: ধানমন্ডি, ঢাকা"
                      className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        রক্তের গ্রুপ (ঐচ্ছিক)
                      </label>
                      <select
                        value={newUserBloodGroup}
                        onChange={(e) => setNewUserBloodGroup(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all text-gray-800"
                      >
                        <option value="">বাছাই করুন</option>
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

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        যোগদানের তারিখ (ঐচ্ছিক)
                      </label>
                      <input
                        type="date"
                        value={newUserJoinDate}
                        onChange={(e) => setNewUserJoinDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm transition-all font-medium text-gray-800 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-5 border-t border-gray-100 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all text-sm cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all text-sm transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>💾</span>
                      <span>সদস্য সেভ করুন</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 px-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center text-lg shadow-inner border border-white/20">
                    🔑
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      পাসওয়ার্ড পরিবর্তন করুন
                    </h3>
                    <p className="text-xs text-amber-100 mt-0.5">এডমিন একাউন্টের নতুন পাসওয়ার্ড দিন</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
                {passwordError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{passwordError}</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm border border-green-200 flex items-center gap-2">
                    <span>✅</span>
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    বর্তমান পাসওয়ার্ড *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm transition-all pr-10"
                      placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-amber-600 transition-colors cursor-pointer select-none"
                      title={showCurrentPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    >
                      {showCurrentPassword ? (
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-2.555 4.14M9.88 9.88a3 3 0 104.243 4.243M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    নতুন পাসওয়ার্ড *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm transition-all pr-10"
                      placeholder="নতুন পাসওয়ার্ড লিখুন"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-amber-600 transition-colors cursor-pointer select-none"
                      title={showNewPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-2.555 4.14M9.88 9.88a3 3 0 104.243 4.243M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    নতুন পাসওয়ার্ড নিশ্চিত করুন *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-sm transition-all pr-10"
                      placeholder="পাসওয়ার্ডটি পুনরায় লিখুন"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-amber-600 transition-colors cursor-pointer select-none"
                      title={showConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-2.555 4.14M9.88 9.88a3 3 0 104.243 4.243M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-100 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-all text-sm cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-amber-600/30 transition-all text-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>💾</span>
                    <span>পাসওয়ার্ড আপডেট করুন</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
