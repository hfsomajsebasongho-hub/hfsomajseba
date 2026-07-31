import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
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

// Initial seed data ONLY if Firestore database collections are completely empty on first initialization
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
    id: "usr_01711223344",
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
    id: "usr_01812345678",
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
export const makeDocId = (prefix: string, keyVal?: string) => {
  if (!keyVal) return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const clean = keyVal.replace(/[^a-zA-Z0-9_\-]/g, "_");
  return `${prefix}_${clean}`;
};

// -------------------------------------------------------------
// Real-time Subscriptions (Pure Firestore Cloud Engine)
// NO localStorage dependencies for datasets
// -------------------------------------------------------------

let globalHasSeededAllUsers = false;
let globalHasSeededCustomLedger = false;
let globalHasSeededLedgerRequests = false;

const checkIsSeeded = async (): Promise<boolean> => {
  try {
    const initDoc = await getDoc(doc(db, "settings", "initialization"));
    if (initDoc.exists() && initDoc.data()?.seeded === true) {
      return true;
    }
  } catch (e) {
    console.warn("Error checking seed status:", e);
  }
  return false;
};

const markAsSeeded = async () => {
  try {
    await setDoc(doc(db, "settings", "initialization"), { seeded: true, updatedAt: Date.now() }, { merge: true });
  } catch (e) {
    console.warn("Error marking seed status:", e);
  }
};

export const subscribeAllUsers = (onData: (users: UserData[]) => void) => {
  const colRef = collection(db, "allUsers");

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !globalHasSeededAllUsers) {
      globalHasSeededAllUsers = true;
      const alreadySeeded = await checkIsSeeded();
      if (!alreadySeeded) {
        await saveAllUsersToDb(INITIAL_USERS);
        await markAsSeeded();
        return;
      }
    }
    if (!snapshot.empty) {
      globalHasSeededAllUsers = true;
      await markAsSeeded();
    }

    const list: UserData[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<UserData, "id">),
    }));

    onData(list);
  }, (err) => {
    console.warn("Firestore allUsers subscribe error:", err);
    onData([]);
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

    onData(list);
  }, (err) => {
    console.warn("Firestore pendingUsers subscribe error:", err);
    onData([]);
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

    onData(list);
  }, (err) => {
    console.warn("Firestore pendingDonations subscribe error:", err);
    onData([]);
  });

  return unsubscribe;
};

export const subscribeCustomLedger = (onData: (entries: LedgerEntry[]) => void) => {
  const colRef = collection(db, "customLedgerEntries");

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !globalHasSeededCustomLedger) {
      globalHasSeededCustomLedger = true;
      const alreadySeeded = await checkIsSeeded();
      if (!alreadySeeded) {
        await saveCustomLedgerToDb(INITIAL_CUSTOM_ENTRIES);
        await markAsSeeded();
        return;
      }
    }
    if (!snapshot.empty) {
      globalHasSeededCustomLedger = true;
      await markAsSeeded();
    }

    const list: LedgerEntry[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<LedgerEntry, "id">),
    }));

    onData(list);
  }, (err) => {
    console.warn("Firestore customLedgerEntries subscribe error:", err);
    onData([]);
  });

  return unsubscribe;
};

export const subscribeLedgerRequests = (onData: (requests: LedgerRequest[]) => void) => {
  const colRef = collection(db, "ledgerViewRequests");

  const unsubscribe = onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && !globalHasSeededLedgerRequests) {
      globalHasSeededLedgerRequests = true;
      const alreadySeeded = await checkIsSeeded();
      if (!alreadySeeded) {
        await saveLedgerRequestsToDb(INITIAL_LEDGER_REQUESTS);
        await markAsSeeded();
        return;
      }
    }
    if (!snapshot.empty) {
      globalHasSeededLedgerRequests = true;
      await markAsSeeded();
    }

    const list: LedgerRequest[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<LedgerRequest, "id">),
    }));

    onData(list);
  }, (err) => {
    console.warn("Firestore ledgerViewRequests subscribe error:", err);
    onData([]);
  });

  return unsubscribe;
};

export const subscribeAdminAccounts = (onData: (accountsSecStr: string) => void) => {
  const docRef = doc(db, "settings", "adminAccounts");

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.accountsSec) {
        onData(data.accountsSec);
      }
    }
  }, (err) => {
    console.warn("Firestore adminAccounts subscribe error:", err);
  });

  return unsubscribe;
};

// -------------------------------------------------------------
// Direct Firestore Single & Bulk Mutations
// -------------------------------------------------------------

export const saveAllUsersToDb = async (users: UserData[]) => {
  try {
    const activeDocIds = new Set<string>();
    for (const user of users) {
      const docId = user.id || makeDocId("usr", user.phone || user.email || user.name);
      user.id = docId;
      activeDocIds.add(docId);
      await setDoc(doc(db, "allUsers", docId), { ...user, id: docId }, { merge: true });
    }
    const snap = await getDocs(collection(db, "allUsers"));
    for (const docSnap of snap.docs) {
      if (!activeDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "allUsers", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving allUsers to Firestore:", err);
  }
};

export const savePendingUsersToDb = async (pendingUsers: PendingUser[]) => {
  try {
    const activeDocIds = new Set<string>();
    for (const pUser of pendingUsers) {
      const docId = pUser.id || makeDocId("pu", pUser.phone || pUser.email || pUser.name);
      pUser.id = docId;
      activeDocIds.add(docId);
      await setDoc(doc(db, "pendingUsers", docId), { ...pUser, id: docId }, { merge: true });
    }
    const snap = await getDocs(collection(db, "pendingUsers"));
    for (const docSnap of snap.docs) {
      if (!activeDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "pendingUsers", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving pendingUsers to Firestore:", err);
  }
};

export const savePendingDonationsToDb = async (pendingDonations: PendingDonation[]) => {
  try {
    const activeDocIds = new Set<string>();
    for (const pDonation of pendingDonations) {
      const docId = pDonation.id || makeDocId("pd", pDonation.transactionId || `${pDonation.donorPhone}_${pDonation.date}`);
      pDonation.id = docId;
      activeDocIds.add(docId);
      await setDoc(doc(db, "pendingDonations", docId), { ...pDonation, id: docId }, { merge: true });
    }
    const snap = await getDocs(collection(db, "pendingDonations"));
    for (const docSnap of snap.docs) {
      if (!activeDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "pendingDonations", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving pendingDonations to Firestore:", err);
  }
};

export const saveCustomLedgerToDb = async (entries: LedgerEntry[]) => {
  try {
    const activeDocIds = new Set<string>();
    for (const entry of entries) {
      const docId = entry.id || makeDocId("leg", `${entry.donorName}_${entry.date}_${entry.incomeAmount || entry.expenseAmount}`);
      entry.id = docId;
      activeDocIds.add(docId);
      await setDoc(doc(db, "customLedgerEntries", docId), { ...entry, id: docId }, { merge: true });
    }
    const snap = await getDocs(collection(db, "customLedgerEntries"));
    for (const docSnap of snap.docs) {
      if (!activeDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "customLedgerEntries", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving customLedgerEntries to Firestore:", err);
  }
};

export const saveLedgerRequestsToDb = async (requests: LedgerRequest[]) => {
  try {
    const activeDocIds = new Set<string>();
    for (const req of requests) {
      const docId = req.id || makeDocId("req", req.phone || req.requesterName);
      req.id = docId;
      activeDocIds.add(docId);
      await setDoc(doc(db, "ledgerViewRequests", docId), { ...req, id: docId }, { merge: true });
    }
    const snap = await getDocs(collection(db, "ledgerViewRequests"));
    for (const docSnap of snap.docs) {
      if (!activeDocIds.has(docSnap.id)) {
        await deleteDoc(doc(db, "ledgerViewRequests", docSnap.id));
      }
    }
  } catch (err) {
    console.warn("Error saving ledgerViewRequests to Firestore:", err);
  }
};

export const saveAdminAccountsSecToDb = async (accountsSecStr: string) => {
  try {
    await setDoc(doc(db, "settings", "adminAccounts"), { accountsSec: accountsSecStr, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn("Error saving adminAccounts to Firestore:", err);
  }
};

// Single document helpers
export const addPendingDonationToDb = async (pDonation: PendingDonation) => {
  try {
    const docId = pDonation.id || makeDocId("pd", pDonation.transactionId || `${pDonation.donorPhone}_${Date.now()}`);
    await setDoc(doc(db, "pendingDonations", docId), { ...pDonation, id: docId }, { merge: true });
  } catch (err) {
    console.warn("Error adding pendingDonation to Firestore:", err);
  }
};

export const addPendingUserToDb = async (pUser: PendingUser) => {
  try {
    const docId = pUser.id || makeDocId("pu", pUser.phone || pUser.email || pUser.name);
    await setDoc(doc(db, "pendingUsers", docId), { ...pUser, id: docId }, { merge: true });
  } catch (err) {
    console.warn("Error adding pendingUser to Firestore:", err);
  }
};

export const addLedgerRequestToDb = async (req: LedgerRequest) => {
  try {
    const docId = req.id || makeDocId("req", req.phone || req.requesterName);
    await setDoc(doc(db, "ledgerViewRequests", docId), { ...req, id: docId }, { merge: true });
  } catch (err) {
    console.warn("Error adding ledgerRequest to Firestore:", err);
  }
};

export const deleteLedgerRequestFromDb = async (docId: string) => {
  try {
    await deleteDoc(doc(db, "ledgerViewRequests", docId));
  } catch (err) {
    console.warn("Error deleting ledgerRequest from Firestore:", err);
  }
};

export const deletePendingDonationFromDb = async (docId: string) => {
  try {
    await deleteDoc(doc(db, "pendingDonations", docId));
  } catch (err) {
    console.warn("Error deleting pendingDonation from Firestore:", err);
  }
};

export const deletePendingUserFromDb = async (docId: string) => {
  try {
    await deleteDoc(doc(db, "pendingUsers", docId));
  } catch (err) {
    console.warn("Error deleting pendingUser from Firestore:", err);
  }
};

export const deleteCustomLedgerFromDb = async (docId: string) => {
  try {
    await deleteDoc(doc(db, "customLedgerEntries", docId));
  } catch (err) {
    console.warn("Error deleting customLedgerEntry from Firestore:", err);
  }
};

export const deleteUserFromDb = async (docId: string) => {
  try {
    await deleteDoc(doc(db, "allUsers", docId));
  } catch (err) {
    console.warn("Error deleting user from Firestore:", err);
  }
};
