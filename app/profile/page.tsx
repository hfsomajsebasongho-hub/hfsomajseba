"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DonationReceipt from "../components/DonationReceipt";
import DonationForm from "../components/DonationForm";

// User data type
interface Donation {
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
  donations: Donation[];
}

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Registration form state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regBloodGroup, setRegBloodGroup] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

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

  // Ledger Request State (আয় ব্যয় হিসাব)
  const [userLedgerRequest, setUserLedgerRequest] = useState<any>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const checkUserLedgerRequest = (currentPhone?: string, currentEmail?: string) => {
    if (typeof window === "undefined") return;
    const phone = currentPhone || userData.phone;
    const email = currentEmail || userData.email;
    if (!phone && (!email || email === "-")) return;

    const requests = JSON.parse(localStorage.getItem("ledgerViewRequests") || "[]");
    const userReq = requests.find((r: any) => 
      (phone && phone !== "-" && r.phone === phone) ||
      (email && email !== "-" && r.email === email)
    );
    setUserLedgerRequest(userReq || null);
  };

  // Handle requesting ledger view from Admin
  const handleRequestLedgerView = () => {
    if (!userData || !userData.name || !userData.phone) {
      alert("অনুরোধ পাঠানোর জন্য আপনার প্রোফাইল তথ্য সঠিক থাকা প্রয়োজন");
      return;
    }

    const requests = JSON.parse(localStorage.getItem("ledgerViewRequests") || "[]");
    
    // Find index of existing request if any
    const existingIndex = requests.findIndex((r: any) => 
      (r.phone && r.phone === userData.phone) || (r.email && r.email !== "-" && r.email === userData.email)
    );

    const newReq = {
      id: "req-" + Date.now(),
      requesterName: userData.name,
      phone: userData.phone,
      email: userData.email || "-",
      requestDate: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
      reason: "ইউজার প্রোফাইল থেকে আয়-ব্যয় বিবরণী দেখার অনুরোধ",
      status: "pending",
    };

    if (existingIndex !== -1) {
      requests[existingIndex] = newReq;
    } else {
      requests.unshift(newReq);
    }

    localStorage.setItem("ledgerViewRequests", JSON.stringify(requests));
    setUserLedgerRequest(newReq);
    alert("আপনার আয়-ব্যয় হিসাব দেখার অনুরোধটি এডমিন প্যানেলে সফলভাবে পাঠানো হয়েছে। এডমিন অনুমোদন করলে আপনি সরাসরি PDF রিপোর্ট ডাউনলোড করে দেখতে পারবেন।");
  };

  // Helper to parse Bengali date string to timestamp for sorting
  const parseBengaliDateToTimestamp = (dateStr: string, fallbackId?: string): number => {
    if (!dateStr) return 0;
    const banglaDigits: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    let englishStr = dateStr.replace(/[০-৯]/g, (w) => banglaDigits[w]);

    const monthsMap: Record<string, string> = {
      'জানুয়ারি': 'January', 'জানুয়ারী': 'January',
      'ফেব্রুয়ারি': 'February', 'ফেব্রুয়ারী': 'February',
      'মার্চ': 'March', 'এপ্রিল': 'April', 'মে': 'May',
      'জুন': 'June', 'জুলাই': 'July', 'আগস্ট': 'August',
      'সেপ্টেম্বর': 'September', 'অক্টোবর': 'October',
      'নভেম্বর': 'November', 'ডিসেম্বর': 'December'
    };

    Object.entries(monthsMap).forEach(([bn, en]) => {
      englishStr = englishStr.replace(bn, en);
    });

    const parsed = new Date(englishStr).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  // Download Income & Expense PDF Statement (100% Identical Format to Admin Panel PDF)
  const downloadUserLedgerPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const customEntries = JSON.parse(localStorage.getItem("customLedgerEntries") || "[]");
      const allUsersData = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const savedUserStr = localStorage.getItem("userData");
      const savedUserObj = savedUserStr ? JSON.parse(savedUserStr) : null;

      const combinedLedger: any[] = [];
      const processedIds = new Set<string>();

      // 1. Custom entries (Income & Expense)
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
          });
        }
      });

      // 2. Approved User donations from allUsers & current user
      const allUsersToScan = [...allUsersData];
      if (savedUserObj && !allUsersToScan.some((u: any) => (u.phone && u.phone === savedUserObj.phone) || (u.email && u.email !== "-" && u.email === savedUserObj.email))) {
        allUsersToScan.push(savedUserObj);
      }

      allUsersToScan.forEach((user: any) => {
        if (user.donations && Array.isArray(user.donations)) {
          user.donations.forEach((donation: any) => {
            if (donation.status === "approved") {
              const txId = donation.transactionId || `approved-${user.phone || user.name}-${donation.date}-${donation.amount}`;
              const ledgerId = `ledger-appr-${txId}`;
              if (!processedIds.has(txId) && !processedIds.has(ledgerId)) {
                processedIds.add(txId);
                processedIds.add(ledgerId);
                combinedLedger.push({
                  id: txId,
                  timestamp: donation.timestamp || parseBengaliDateToTimestamp(donation.date, txId),
                  date: donation.date || "",
                  donorName: user.name || "অজানা",
                  phone: user.phone || "-",
                  method: donation.method || "অন্যান্য",
                  type: "income",
                  incomeAmount: Number(donation.amount) || 0,
                  expenseAmount: 0,
                  remarks: "অনুমোদিত দান",
                });
              }
            }
          });
        }
      });

      // Sort descending by timestamp
      combinedLedger.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      if (combinedLedger.length === 0) {
        alert("বর্তমানে ডাউনলোড করার মতো কোনো আয়/ব্যয় হিসাব পাওয়া যায়নি");
        setIsGeneratingPdf(false);
        return;
      }

      const totalIncome = combinedLedger.reduce((sum, item) => sum + (item.incomeAmount || 0), 0);
      const totalExpense = combinedLedger.reduce((sum, item) => sum + (item.expenseAmount || 0), 0);
      const netBalance = totalIncome - totalExpense;
      const todayBn = new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

      // Load logo image as Base64 data URL for html2canvas (identical to Admin Panel)
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

      // Create printable off-screen DOM element (100% Identical HTML/CSS to Admin Panel)
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "800px";
      container.style.backgroundColor = "#ffffff";
      container.style.padding = "30px";
      container.style.color = "#1f2937";
      container.style.fontFamily = "'SolaimanLipi', 'Segoe UI', Arial, sans-serif";

      const rowsHtml = combinedLedger.map((item, idx) => `
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
          <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">ডাউনলোডের তারিখ: ${todayBn} | আবেদনকারী: ${userData.name || "সদস্য"}</p>
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
      const imgWidth = pdfWidth - 20;
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

      pdf.save(`HF_Somajseba_Ledger_${(userData.name || "user").replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF ফাইল তৈরি করতে সমস্যা হয়েছে");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Load user data from localStorage on mount and when page gets focus
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "register" || params.get("tab") === "register") {
        setShowLogin(false);
      }
    }

    const loadUserData = () => {
      const savedUser = localStorage.getItem("userData");
      const savedLoginStatus = localStorage.getItem("isLoggedIn");
      
      if (savedUser) {
        const user = JSON.parse(savedUser);
        checkUserLedgerRequest(user.phone, user.email);
        
        const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        const customEntries = JSON.parse(localStorage.getItem("customLedgerEntries") || "[]");
        
        const userPhoneClean = (user.phone || "").replace(/[^0-9]/g, "");
        const userInAllUsers = allUsers.find(
          (u: any) => (u.phone && (u.phone === user.phone || u.phone.replace(/[^0-9]/g, "") === userPhoneClean)) ||
                      (u.email && u.email !== "-" && u.email === user.email)
        );
        
        let combinedDonations: Donation[] = user.donations ? [...user.donations] : [];
        
        // 1. Sync from allUsers if present
        if (userInAllUsers && userInAllUsers.donations && Array.isArray(userInAllUsers.donations)) {
          userInAllUsers.donations.forEach((d: any) => {
            if (!combinedDonations.some(existing => existing.transactionId === d.transactionId || (existing.date === d.date && existing.amount === d.amount))) {
              combinedDonations.push(d);
            }
          });
        }

        // 2. Sync from customLedgerEntries if phone number matches
        if (userPhoneClean) {
          customEntries.forEach((ce: any) => {
            const cePhoneClean = (ce.phone || "").replace(/[^0-9]/g, "");
            if (cePhoneClean && cePhoneClean === userPhoneClean) {
              const entryTxId = ce.id || ce.transactionId || `manual-${ce.date}-${ce.incomeAmount || ce.expenseAmount}`;
              const exists = combinedDonations.some(
                (d) => d.transactionId === entryTxId || (d.date === ce.date && d.amount === (ce.incomeAmount || ce.expenseAmount))
              );
              if (!exists) {
                combinedDonations.push({
                  amount: ce.incomeAmount > 0 ? ce.incomeAmount : ce.expenseAmount,
                  date: ce.date || "",
                  method: ce.method || "নগদ",
                  transactionId: entryTxId,
                  senderPhone: ce.phone,
                  status: "approved",
                  receipt: {
                    donorName: user.name,
                    donorPhone: user.phone,
                    donorAddress: user.address || "",
                    donorBloodGroup: user.bloodGroup || "",
                    remarks: ce.remarks || (ce.type === "expense" ? "ম্যানুয়াল ব্যয়" : "ম্যানুয়াল আয়"),
                    type: ce.type || (ce.expenseAmount > 0 ? "expense" : "income")
                  }
                });
              }
            }
          });
        }

        // Calculate updated totals
        const approvedDons = combinedDonations.filter(d => d.status === "approved");
        const updatedTotal = approvedDons.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
        
        const updatedUser = {
          ...user,
          donations: combinedDonations,
          totalDonation: updatedTotal,
          donationCount: approvedDons.length
        };
        
        setUserData(updatedUser);
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        
        // Ensure user is in allUsers list
        const existingIndex = allUsers.findIndex((u: any) => u.email === user.email || u.phone === user.phone);
        if (existingIndex === -1 && user.name) {
          allUsers.push({
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address || "",
            bloodGroup: user.bloodGroup || "",
            joinDate: user.joinDate,
            totalDonation: updatedTotal,
            donationCount: approvedDons.length,
            donations: combinedDonations
          });
          localStorage.setItem("allUsers", JSON.stringify(allUsers));
        } else if (existingIndex !== -1) {
          allUsers[existingIndex] = {
            ...allUsers[existingIndex],
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address || allUsers[existingIndex].address || "",
            bloodGroup: user.bloodGroup || "",
            totalDonation: updatedTotal,
            donationCount: approvedDons.length,
            donations: combinedDonations
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
    
    const loginInput = loginEmail.trim();
    if (!loginInput) {
      setLoginError("মোবাইল নম্বর বা ইমেইল দিন");
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
    
    // 1. Check if user is in pendingUsers (not approved yet by Admin)
    const pendingUsers = JSON.parse(localStorage.getItem("pendingUsers") || "[]");
    const pendingUser = pendingUsers.find(
      (u: any) => u.phone === loginInput || (u.email && u.email !== "-" && u.email === loginInput)
    );
    
    if (pendingUser) {
      if (pendingUser.status === "pending") {
        setLoginError("⏳ এপ্রুভের জন্য অপেক্ষা করুন। (এডমিন অনুমোদনের পর লগইন করতে পারবেন)");
        return;
      } else if (pendingUser.status === "rejected") {
        setLoginError("❌ আপনার অ্যাকাউন্ট বাতিল করা হয়েছে। আমাদের সাথে যোগাযোগ করুন।");
        return;
      }
    }
    
    // 2. Check in allUsers if approved
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const foundUser = allUsers.find(
      (u: any) => u.phone === loginInput || (u.email && u.email !== "-" && u.email === loginInput)
    );
    
    if (foundUser) {
      // Check if user has pending status
      const isPending = pendingUsers.some(
        (u: any) => (u.phone === loginInput || (u.email && u.email !== "-" && u.email === loginInput)) && u.status === "pending"
      );
      if (isPending) {
        setLoginError("⏳ এপ্রুভের জন্য অপেক্ষা করুন। (এডমিন অনুমোদনের পর লগইন করতে পারবেন)");
        return;
      }

      // Load user data from allUsers
      const userToLoad: UserData = {
        name: foundUser.name,
        email: foundUser.email || "-",
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
      setLoginError("⏳ এপ্রুভের জন্য অপেক্ষা করুন। (প্রথমে রেজিস্টার করুন এবং এডমিন অনুমোদনের পর লগইন করুন)");
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
    if (!regAddress.trim()) {
      setRegError("আপনার ঠিকানা দিন");
      return;
    }
    if (!regBloodGroup) {
      setRegError("রক্তের গ্রুপ নির্বাচন করুন");
      return;
    }
    const userEmail = regEmail.trim() || "-";
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
    
    // Add to pendingUsers list (awaiting admin approval)
    const pendingUsers = JSON.parse(localStorage.getItem("pendingUsers") || "[]");
    const existingPendingIndex = pendingUsers.findIndex((u: any) => u.phone === regPhone || (userEmail !== "-" && u.email === userEmail));
    
    const newPendingUser = {
      name: regName.trim(),
      email: userEmail,
      phone: regPhone.trim(),
      address: regAddress.trim(),
      bloodGroup: regBloodGroup,
      registrationDate: banglaDate,
      status: "pending" as const,
    };

    if (existingPendingIndex === -1) {
      pendingUsers.push(newPendingUser);
    } else {
      pendingUsers[existingPendingIndex] = newPendingUser;
    }
    localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers));
    
    // Show success message
    setRegSuccess(true);
    
    // Clear form but don't login yet - show pending message
    setTimeout(() => {
      setRegName("");
      setRegPhone("");
      setRegBloodGroup("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");
      setShowLogin(true);
      setRegSuccess(false);
    }, 2000);
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
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-4">
          <div className={`mx-auto transition-all duration-300 ${showLogin ? "max-w-md" : "max-w-xl"}`}>
            {/* Login/Register Toggle */}
            <div className="flex bg-gray-200 rounded-full p-1 mb-6">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2.5 rounded-full font-bold transition-colors text-sm ${
                  showLogin ? "bg-blue-600 text-white shadow" : "text-gray-600"
                }`}
              >
                লগইন
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2.5 rounded-full font-bold transition-colors text-sm ${
                  !showLogin ? "bg-blue-600 text-white shadow" : "text-gray-600"
                }`}
              >
                রেজিস্টার
              </button>
            </div>

            {showLogin ? (
              /* Login Form */
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">👤</div>
                  <h1 className="text-2xl font-extrabold text-blue-900">লগইন করুন</h1>
                  <p className="text-gray-600 text-sm font-medium">আপনার একাউন্টে প্রবেশ করুন</p>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2.5 rounded-xl mb-4 text-sm flex items-center gap-2 font-medium">
                    <span>⚠️</span>
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-gray-900 text-sm font-bold mb-1.5">ইমেইল / মোবাইল</label>
                    <input
                      type="text"
                      placeholder="আপনার ইমেইল বা মোবাইল নম্বর"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-sm transition-all placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-900 text-sm font-bold mb-1.5">পাসওয়ার্ড</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="আপনার পাসওয়ার্ড"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-sm transition-all placeholder:text-gray-400 placeholder:font-normal pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer select-none"
                        title={showLoginPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                      >
                        {showLoginPassword ? (
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-2.555 4.14M9.88 9.88a3 3 0 104.243 4.243M3 3l18 18" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-base cursor-pointer"
                  >
                    লগইন
                  </button>
                </form>

                <div className="text-center mt-5">
                  <a href="#" className="text-blue-600 hover:underline text-sm font-bold">পাসওয়ার্ড ভুলে গেছেন?</a>
                </div>
              </div>
            ) : (
              /* Register Form */
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">📝</div>
                  <h1 className="text-2xl font-extrabold text-blue-900">রেজিস্টার করুন</h1>
                  <p className="text-gray-600 text-sm font-medium">নতুন একাউন্ট তৈরি করতে নিচের তথ্যগুলো পূরণ করুন</p>
                </div>

                {regError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2.5 rounded-xl mb-4 text-sm flex items-center gap-2 font-medium">
                    <span>⚠️</span>
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2 font-medium">
                    <span>⏳</span>
                    <span>রেজিস্ট্রেশন সফল হয়েছে! আপনার অ্যাকাউন্ট অনুমোদনের জন্য অপেক্ষমান।</span>
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-900 text-sm font-bold mb-1.5">
                        আপনার নাম <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="পুরো নাম"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-sm transition-all placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 text-sm font-bold mb-1.5">
                        মোবাইল নম্বর <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-sm transition-all placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-900 text-sm font-bold mb-1.5">
                        ঠিকানা <span className="text-red-600 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: ঢাকা, বাংলাদেশ"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-sm transition-all placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-900 text-sm font-bold mb-1.5">
                        রক্তের গ্রুপ <span className="text-red-600 font-bold">*</span>
                      </label>
                      <select
                        value={regBloodGroup}
                        onChange={(e) => setRegBloodGroup(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-sm transition-all cursor-pointer"
                      >
                        <option value="">বাছাই করুন</option>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-900 text-sm font-bold mb-1.5">
                        পাসওয়ার্ড <span className="text-red-600 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          placeholder="কমপক্ষে ৬ অক্ষর"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-sm transition-all placeholder:text-gray-400 placeholder:font-normal pr-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer select-none"
                          title={showRegPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                        >
                          {showRegPassword ? (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-2.555 4.14M9.88 9.88a3 3 0 104.243 4.243M3 3l18 18" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-900 text-sm font-bold mb-1.5">
                        পাসওয়ার্ড নিশ্চিত করুন <span className="text-red-600 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? "text" : "password"}
                          placeholder="পুনরায় লিখুন"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-gray-900 font-semibold text-sm transition-all placeholder:text-gray-400 placeholder:font-normal pr-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer select-none"
                          title={showRegConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                        >
                          {showRegConfirmPassword ? (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-2.555 4.14M9.88 9.88a3 3 0 104.243 4.243M3 3l18 18" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regSuccess}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-base mt-3 cursor-pointer"
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDonateModal(true)}
                  className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-lg md:text-xl px-7 py-3 rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl shadow-yellow-500/40 hover:scale-108 active:scale-95 flex items-center gap-2.5 cursor-pointer ring-4 ring-yellow-400/40"
                >
                  <span className="text-2xl animate-bounce">💝</span>
                  <span>এখনই দান করুন</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-bold transition-colors text-sm md:text-base cursor-pointer"
                >
                  লগআউট
                </button>
              </div>
            </div>
          </div>

          {/* Income & Expense Ledger Request Card (আয় ব্যয় হিসাব) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-6 shadow-xl text-white mb-8 border border-indigo-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/10 shadow-inner">
                  📊
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                    <span>আয় ব্যয় হিসাব</span>
                  </h3>
                  <p className="text-xs text-indigo-200 mt-1">
                    সংগঠনের অর্থনৈতিক স্বচ্ছতার জন্য বিস্তারিত আয় ও খরচের বিবরণী অফিশিয়ালভাবে পেতে অনুরোধ জানান
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {!userLedgerRequest ? (
                  <button
                    onClick={handleRequestLedgerView}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span>📊</span>
                    <span>আয় ব্যয় হিসাব দেখার অনুরোধ করুন</span>
                  </button>
                ) : userLedgerRequest.status === "pending" ? (
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2">
                      <span className="animate-pulse">⏳</span>
                      <span>আয় ব্যয় হিসাব (অনুরোধ অপেক্ষমাণ...)</span>
                    </span>
                  </div>
                ) : userLedgerRequest.status === "approved" ? (
                  <div className="flex flex-col items-center md:items-end gap-2.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleRequestLedgerView}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-all text-xs flex items-center gap-1.5 cursor-pointer border border-blue-400/30"
                        title="নতুন বা হালনাগাদ হিসাব দেখতে এডমিনের কাছে অনুরোধ পাঠান"
                      >
                        <span>🔄</span>
                        <span>নতুন হিসাব দেখুন</span>
                      </button>
                      <button
                        onClick={downloadUserLedgerPDF}
                        disabled={isGeneratingPdf}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all text-sm flex items-center gap-2 cursor-pointer"
                      >
                        {isGeneratingPdf ? (
                          <>
                            <span className="animate-spin">⏳</span>
                            <span>PDF ফাইল তৈরি হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <span>📄</span>
                            <span>হিসাব দেখুন (PDF)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : userLedgerRequest.status === "rejected" ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5">
                      <span>✕</span>
                      <span>অনুরোধ বাতিল হয়েছে</span>
                    </span>
                    <button
                      onClick={handleRequestLedgerView}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>🔄</span>
                      <span>পুনরায় অনুরোধ করুন</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mb-8">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-500 text-sm">নাম</label>
                      <p className="font-medium">{userData.name || "সেট করা হয়নি"}</p>
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
          </div>

          {/* Donation History */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                <span>📜</span> দানের ইতিহাস
              </h2>
              <button
                onClick={() => setShowDonateModal(true)}
                className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-slate-950 font-black text-base md:text-lg px-6 py-2.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl shadow-yellow-500/30 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer ring-2 ring-yellow-400/40"
              >
                <span className="text-xl">💝</span>
                <span>এখনই দান করুন</span>
              </button>
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
                      <th className="text-center py-3 px-4 text-gray-600">অ্যাকশন</th>
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
                        <td className="py-4 px-4 text-center">
                          {donation.status === "approved" && donation.receipt ? (
                            <button
                              onClick={() => {
                                setSelectedReceipt(donation.receipt);
                                setShowReceipt(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                            >
                              🖨️ প্রিন্ট
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
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

      {/* Donation Receipt Modal */}
      {selectedReceipt && (
        <DonationReceipt
          donorName={selectedReceipt.donorName}
          amount={selectedReceipt.amount}
          paymentMethod={selectedReceipt.paymentMethod}
          transactionId={selectedReceipt.transactionId}
          date={selectedReceipt.date}
          senderPhone={selectedReceipt.senderPhone}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Donation Form Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100 my-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">
                  💝
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-900">দান করুন</h2>
                  <p className="text-xs text-gray-500">আপনার সাহায্য একজন মানুষের জীবন বদলে দিতে পারে</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDonateModal(false);
                  const savedUser = localStorage.getItem("userData");
                  if (savedUser) {
                    setUserData(JSON.parse(savedUser));
                  }
                }}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <DonationForm />
          </div>
        </div>
      )}
    </div>
  );
}
