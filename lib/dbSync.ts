import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
} from "firebase/firestore";

export interface DonationRecord {
  amount: number;
  date: string;
  method: string;
  transactionId?: string;
  senderPhone?: string;
  status?: string;
  receipt?: any;
}

export interface UserData {
  id?: string;
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

export interface PendingUser {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  bloodGroup: string;
  registrationDate: string;
  status: "pending" | "approved" | "rejected";
}

export interface PendingDonation {
  id?: string;
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

export interface LedgerEntry {
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

export interface LedgerRequest {
  id: string;
  requesterName: string;
  phone: string;
  email?: string;
  requestDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

// Initial seed data if Firestore collections are completely empty
const INITIAL_CUSTOM_ENTRIES: LedgerEntry[] = [
  {
    id: "init-1",
    timestamp: Date.now() - 86400000,
    date: "২৫ মে ২০২৬",
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
  },
];

const INITIAL_USERS: UserData[] = [
  {
    id: "user-init-1",
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
        status: "approved",
      },
    ],
  },
  {
    id: "user-init-2",
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
        status: "approved",
      },
    ],
  },
];

const INITIAL_LEDGER_REQUESTS: LedgerRequest[] = [
  {
    id: "req-101",
    requesterName: "মোঃ হাসান মাহমুদ",
    phone: "01755667788",
    email: "hasan@gmail.com",
    requestDate: "২৮ মে ২০২৬",
    reason: "বাৎসরিক সাধারণ সভার জন্য আয় ও খরচের সম্পূর্ণ হিসাব বিবরণী প্রয়োজন",
    status: "pending",
  },
  {
    id: "req-102",
    requesterName: "সাদিয়া তানজিম",
    phone: "01899887766",
    email: "sadia@gmail.com",
    requestDate: "২৬ মে ২০২৬",
    reason: "সংগঠনের নিরিক্ষণ (Audit) কাজের তথ্য সংগ্রহ",
    status: "pending",
  },
  {
    id: "req-103",
    requesterName: "আব্দুর রহমান",
    phone: "01911223344",
    email: "rahman@gmail.com",
    requestDate: "২০ মে ২০২৬",
    reason: "মাসিক অনুদানের ভাউচার যাচাইকরণ",
    status: "approved",
  },
];

// Helper to generate clean Firestore doc IDs from key values
const makeDocId = (prefix: string, keyVal?: string) => {
  if (!keyVal) return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const clean = keyVal.replace(/[^a-zA-Z0-9_\-]/g, "_");
  return `${prefix}_${clean}`;
};

// -------------------------------------------------------------
// Real-time Subscriptions with fallback to localStorage
// -------------------------------------------------------------

export const subscribeAllUsers = (onData: (users: UserData[]) => void) => {
  const colRef = collection(db, "allUsers");
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded) {
      hasSeeded = true;
      // If Firestore is empty, seed with INITIAL_USERS or local storage users
      const local = typeof window !== "undefined" ? localStorage.getItem("allUsers") : null;
      let usersToSeed = INITIAL_USERS;
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            usersToSeed = parsed;
          }
        } catch (e) {}
      }
      await saveAllUsersToDb(usersToSeed);
      return;
    }

    const list: UserData[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<UserData, "id">),
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("allUsers", JSON.stringify(list));
    }
    onData(list);
  }, (err) => {
    console.warn("Firestore allUsers subscribe error:", err);
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("allUsers");
      if (local) {
        try { onData(JSON.parse(local)); } catch (e) {}
      }
    }
  });

  return unsubscribe;
};

export const subscribePendingUsers = (onData: (users: PendingUser[]) => void) => {
  const colRef = collection(db, "pendingUsers");

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    const list: PendingUser[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<PendingUser, "id">),
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("pendingUsers", JSON.stringify(list));
    }
    onData(list);
  }, (err) => {
    console.warn("Firestore pendingUsers subscribe error:", err);
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("pendingUsers");
      if (local) {
        try { onData(JSON.parse(local)); } catch (e) {}
      }
    }
  });

  return unsubscribe;
};

export const subscribePendingDonations = (onData: (donations: PendingDonation[]) => void) => {
  const colRef = collection(db, "pendingDonations");

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    const list: PendingDonation[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<PendingDonation, "id">),
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("pendingDonations", JSON.stringify(list));
    }
    onData(list);
  }, (err) => {
    console.warn("Firestore pendingDonations subscribe error:", err);
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("pendingDonations");
      if (local) {
        try { onData(JSON.parse(local)); } catch (e) {}
      }
    }
  });

  return unsubscribe;
};

export const subscribeCustomLedger = (onData: (entries: LedgerEntry[]) => void) => {
  const colRef = collection(db, "customLedgerEntries");
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded) {
      hasSeeded = true;
      const local = typeof window !== "undefined" ? localStorage.getItem("customLedgerEntries") : null;
      let entriesToSeed = INITIAL_CUSTOM_ENTRIES;
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            entriesToSeed = parsed;
          }
        } catch (e) {}
      }
      await saveCustomLedgerToDb(entriesToSeed);
      return;
    }

    const list: LedgerEntry[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<LedgerEntry, "id">),
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("customLedgerEntries", JSON.stringify(list));
    }
    onData(list);
  }, (err) => {
    console.warn("Firestore customLedgerEntries subscribe error:", err);
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("customLedgerEntries");
      if (local) {
        try { onData(JSON.parse(local)); } catch (e) {}
      }
    }
  });

  return unsubscribe;
};

export const subscribeLedgerRequests = (onData: (requests: LedgerRequest[]) => void) => {
  const colRef = collection(db, "ledgerViewRequests");
  let hasSeeded = false;

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !hasSeeded) {
      hasSeeded = true;
      const local = typeof window !== "undefined" ? localStorage.getItem("ledgerViewRequests") : null;
      let reqsToSeed = INITIAL_LEDGER_REQUESTS;
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            reqsToSeed = parsed;
          }
        } catch (e) {}
      }
      await saveLedgerRequestsToDb(reqsToSeed);
      return;
    }

    const list: LedgerRequest[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<LedgerRequest, "id">),
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("ledgerViewRequests", JSON.stringify(list));
    }
    onData(list);
  }, (err) => {
    console.warn("Firestore ledgerViewRequests subscribe error:", err);
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("ledgerViewRequests");
      if (local) {
        try { onData(JSON.parse(local)); } catch (e) {}
      }
    }
  });

  return unsubscribe;
};

export const subscribeAdminAccounts = (onData: (accountsSecStr: string) => void) => {
  const docRef = doc(db, "settings", "adminAccounts");

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.accountsSec) {
        if (typeof window !== "undefined") {
          localStorage.setItem("adminAccounts_sec", data.accountsSec);
        }
        onData(data.accountsSec);
      }
    }
  }, (err) => {
    console.warn("Firestore adminAccounts subscribe error:", err);
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("adminAccounts_sec");
      if (local) onData(local);
    }
  });

  return unsubscribe;
};

// -------------------------------------------------------------
// Write / Update Mutations
// -------------------------------------------------------------

export const saveAllUsersToDb = async (users: UserData[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("allUsers", JSON.stringify(users));
  }
  try {
    // Write each user to Firestore
    for (const user of users) {
      const docId = user.id || makeDocId("usr", user.phone || user.email || user.name);
      await setDoc(doc(db, "allUsers", docId), { ...user, id: docId }, { merge: true });
    }
    // Remove deleted docs from Firestore if array shrank
    const snap = await getDocs(collection(db, "allUsers"));
    const currentDocIds = new Set(users.map(u => u.id).filter(Boolean));
    for (const docSnap of snap.docs) {
      if (currentDocIds.size > 0 && !currentDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "allUsers", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving allUsers to Firestore:", err);
  }
};

export const savePendingUsersToDb = async (pendingUsers: PendingUser[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("pendingUsers", JSON.stringify(pendingUsers));
  }
  try {
    for (const pUser of pendingUsers) {
      const docId = pUser.id || makeDocId("pu", pUser.phone || pUser.email || pUser.name);
      await setDoc(doc(db, "pendingUsers", docId), { ...pUser, id: docId }, { merge: true });
    }
    const snap = await getDocs(collection(db, "pendingUsers"));
    const currentDocIds = new Set(pendingUsers.map(u => u.id).filter(Boolean));
    for (const docSnap of snap.docs) {
      if (!currentDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "pendingUsers", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving pendingUsers to Firestore:", err);
  }
};

export const savePendingDonationsToDb = async (pendingDonations: PendingDonation[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("pendingDonations", JSON.stringify(pendingDonations));
  }
  try {
    for (const pDonation of pendingDonations) {
      const docId = pDonation.id || makeDocId("pd", pDonation.transactionId || `${pDonation.donorPhone}_${pDonation.date}`);
      await setDoc(doc(db, "pendingDonations", docId), { ...pDonation, id: docId }, { merge: true });
    }
    const snap = await getDocs(collection(db, "pendingDonations"));
    const currentDocIds = new Set(pendingDonations.map(d => d.id).filter(Boolean));
    for (const docSnap of snap.docs) {
      if (!currentDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "pendingDonations", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving pendingDonations to Firestore:", err);
  }
};

export const saveCustomLedgerToDb = async (entries: LedgerEntry[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("customLedgerEntries", JSON.stringify(entries));
  }
  try {
    for (const entry of entries) {
      const docId = entry.id || makeDocId("leg", `${entry.donorName}_${entry.date}_${entry.incomeAmount || entry.expenseAmount}`);
      await setDoc(doc(db, "customLedgerEntries", docId), { ...entry, id: docId }, { merge: true });
    }
    const snap = await getDocs(collection(db, "customLedgerEntries"));
    const currentDocIds = new Set(entries.map(e => e.id).filter(Boolean));
    for (const docSnap of snap.docs) {
      if (!currentDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "customLedgerEntries", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving customLedgerEntries to Firestore:", err);
  }
};

export const saveLedgerRequestsToDb = async (requests: LedgerRequest[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("ledgerViewRequests", JSON.stringify(requests));
  }
  try {
    for (const req of requests) {
      const docId = req.id || makeDocId("req", req.phone || req.requesterName);
      await setDoc(doc(db, "ledgerViewRequests", docId), { ...req, id: docId }, { merge: true });
    }
    const snap = await getDocs(collection(db, "ledgerViewRequests"));
    const currentDocIds = new Set(requests.map(r => r.id).filter(Boolean));
    for (const docSnap of snap.docs) {
      if (!currentDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "ledgerViewRequests", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving ledgerViewRequests to Firestore:", err);
  }
};

export const saveAdminAccountsSecToDb = async (accountsSecStr: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("adminAccounts_sec", accountsSecStr);
  }
  try {
    await setDoc(doc(db, "settings", "adminAccounts"), { accountsSec: accountsSecStr, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn("Error saving adminAccounts to Firestore:", err);
  }
};
