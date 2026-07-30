"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

export interface GalleryPhoto {
  id: string;
  firestoreDocId?: string;
  title: string;
  category: string;
  date: string;
  imageUrl: string;
  description?: string;
  uploadedBy?: string;
  createdAt?: number;
}

const INITIAL_CATEGORIES = [
  "সবগুলো",
  "ত্রাণ বিতরণ",
  "সমাজসেবা",
  "রক্তদান",
  "চিকিৎসা শিবির",
  "ইভেন্ট",
  "অন্যান্য",
];

const INITIAL_PHOTOS: GalleryPhoto[] = [
  {
    id: "photo-1",
    title: "বন্যা দুর্গতদের মাঝে খাদ্য ত্রাণ বিতরণ প্রোগ্রাম",
    category: "ত্রাণ বিতরণ",
    date: "২০২৬-০৫-১৫",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop",
    description: "HF সমাজসেবা সংঘের পক্ষ থেকে বন্যাকবলিত এলাকায় ৫০০টি পরিবারের মাঝে জরুরি খাদ্যসামগ্রী ও সুপেয় পানি বিতরণ করা হয়।",
    uploadedBy: "Admin",
  },
  {
    id: "photo-2",
    title: "বিনামূল্যে রক্তদান ও ব্লাড গ্রুপিং ক্যাম্পেইন",
    category: "রক্তদান",
    date: "২০২৬-০৪-১০",
    imageUrl: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1000&auto=format&fit=crop",
    description: "বার্ষিক রক্তদান কর্মসূচিতে বিপুল সংখ্যক স্বেচ্ছাসেবী ও স্থানীয় তরুণরা রক্তদান করেন।",
    uploadedBy: "Admin",
  },
  {
    id: "photo-3",
    title: "শীতার্ত মানুষের মাঝে শীতবস্ত্র ও কম্বল বিতরণ",
    category: "সমাজসেবা",
    date: "২০২৬-০১-২০",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop",
    description: "তীব্র শীতে অসহায় ও বয়স্ক ৩‌০০ জন মানুষের হাতে কম্বল ও গরম কাপড় তুলে দেওয়া হয়।",
    uploadedBy: "Admin",
  },
  {
    id: "photo-4",
    title: "ফ্রি ফ্রন্টলাইন মেডিকেল চেকআপ শিবির",
    category: "চিকিৎসা শিবির",
    date: "২০২৫-১১-৩০",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000&auto=format&fit=crop",
    description: "অভিজ্ঞ চিকিৎসকদের সমন্বয়ে দিনব্যাপী ফ্রি ডায়াবেটিস পরীক্ষা, স্বাস্থ্য পরামর্শ ও প্রাথমিক ওষুধ বিতরণ।",
    uploadedBy: "Admin",
  },
  {
    id: "photo-5",
    title: "বৃক্ষরোপণ অভিযান ও পরিবেশ সচেতনতা",
    category: "ইভেন্ট",
    date: "২০২৫-০৯-০৫",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop",
    description: "পরিবেশ রক্ষায় ১০০টি ফলজ ও ঔষধি গাছের চারা রোপণ ও সাধারণ মানুষের মাঝে বিতরণ।",
    uploadedBy: "Admin",
  },
  {
    id: "photo-6",
    title: "শিক্ষাসামগ্রী ও ব্যাগ বিতরণ উৎসব",
    category: "সমাজসেবা",
    date: "২০২৫-৭-১২",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop",
    description: "সুবিধাবঞ্চিত ৫০ জন প্রাথমিক বিদ্যালয়ের শিক্ষার্থীদের হাতে নতুন বই, খাতা, কলম ও ব্যাগ তুলে দেওয়া হলো।",
    uploadedBy: "Admin",
  },
];

export default function GalleryPage() {
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("সবগুলো");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("ত্রাণ বিতরণ");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUrlChange = (val: string) => {
    let cleaned = val.trim();
    // If user pasted HTML/BBCode snippet from ImgBB like <a href="..."><img src="https://i.ibb.co/..."/></a>
    const srcMatch = cleaned.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      cleaned = srcMatch[1];
    }
    setNewImageUrl(cleaned);

    // Validate ImgBB page URL (ibb.co/...) vs Direct Image URL (i.ibb.co/...)
    if (cleaned.includes("ibb.co/") && !cleaned.includes("i.ibb.co/")) {
      setUploadError("⚠️ এটি ImgBB এর ওয়েব পেজের লিংক (ibb.co)। ছবি দেখানোর জন্য ImgBB এর 'Direct link' (i.ibb.co/...) কপি করে দিন।");
    } else {
      setUploadError("");
    }
  };

  useEffect(() => {
    const isLogged = localStorage.getItem("isAdminLoggedIn") === "true";
    setIsAdminLoggedIn(isLogged);

    const fetchPhotos = async () => {
      try {
        const q = query(collection(db, "galleryPhotos"), orderBy("createdAt", "desc"));
        const fetchPromise = getDocs(q);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Firestore timeout")), 3000)
        );
        const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
        if (snapshot && !snapshot.empty) {
          const firestorePhotos: GalleryPhoto[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            firestoreDocId: docSnap.id,
            ...(docSnap.data() as Omit<GalleryPhoto, "id">),
          }));
          setPhotos(firestorePhotos);
          localStorage.setItem("galleryPhotos", JSON.stringify(firestorePhotos));

          const customCats = Array.from(new Set(firestorePhotos.map((p) => p.category)));
          const mergedCats = Array.from(new Set([...INITIAL_CATEGORIES, ...customCats]));
          setCategories(mergedCats);
          localStorage.setItem("galleryCategories", JSON.stringify(mergedCats));
          return;
        }
      } catch (err) {
        console.warn("Firestore fetch warning, loading local fallback:", err);
      }

      const savedCategories = localStorage.getItem("galleryCategories");
      if (savedCategories) {
        try {
          const parsedCat = JSON.parse(savedCategories);
          if (Array.isArray(parsedCat) && parsedCat.length > 0) {
            setCategories(parsedCat);
          }
        } catch (e) {}
      }

      const saved = localStorage.getItem("galleryPhotos");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPhotos(parsed);
            return;
          }
        } catch (e) {}
      }

      setPhotos(INITIAL_PHOTOS);
      localStorage.setItem("galleryPhotos", JSON.stringify(INITIAL_PHOTOS));
    };

    fetchPhotos();
  }, []);

  const savePhotosToStorage = (updatedPhotos: GalleryPhoto[]) => {
    setPhotos(updatedPhotos);
    localStorage.setItem("galleryPhotos", JSON.stringify(updatedPhotos));
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setUploadError("অনুগ্রহ করে ছবির শিরোনাম প্রদান করুন।");
      return;
    }
    if (!newImageUrl) {
      setUploadError("অনুগ্রহ করে ছবির একটি সঠিক URL প্রদান করুন অথবা ImgBB লিংক দিন।");
      return;
    }
    if (newImageUrl.includes("ibb.co/") && !newImageUrl.includes("i.ibb.co/")) {
      setUploadError("⚠️ এটি ImgBB এর ওয়েব পেজের লিংক (ibb.co)। ছবি দেখানোর জন্য ImgBB এর Embed codes -> 'Direct link' (i.ibb.co/...) কপি করে পেস্ট করুন।");
      return;
    }

    setIsSubmitting(true);
    setUploadError("");

    const todayDate = new Date().toISOString().split("T")[0];
    const newPhoto: GalleryPhoto = {
      id: "photo-" + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      date: todayDate,
      imageUrl: newImageUrl.trim(),
      uploadedBy: localStorage.getItem("adminUsername") || "Admin",
      createdAt: Date.now(),
    };

    const updated = [newPhoto, ...photos];
    savePhotosToStorage(updated);

    // Reset form & close modal instantly
    setNewTitle("");
    setNewCategory("ত্রাণ বিতরণ");
    setNewImageUrl("");
    setUploadError("");
    setIsSubmitting(false);
    setShowUploadModal(false);
  };

  const handleDeletePhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিত যে এই ছবিটি মুছে ফেলতে চান?")) return;

    const updated = photos.filter((p) => p.id !== id);
    savePhotosToStorage(updated);
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };

  // Filtered photos based on category & search
  const filteredPhotos = photos.filter((photo) => {
    const matchesCategory =
      selectedCategory === "সবগুলো" || photo.category === selectedCategory;
    const matchesSearch =
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (photo.description &&
        photo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hero / Banner Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-14 px-4 shadow-inner overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <span className="inline-block bg-yellow-400/20 text-yellow-300 font-bold px-4 py-1 rounded-full text-sm mb-3 border border-yellow-400/40 shadow-sm">
            🖼️ কার্যক্রম ও সামাজিক উদ্যোগের ছবি
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">
            HF সমাজসেবা সংঘ ফটো গ্যালারী
          </h1>
          <p className="text-blue-100 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            আমাদের সকল সমাজসেবামূলক ইভেন্ট, ত্রাণ বিতরণ, রক্তদান ও উন্নয়নমূলক কর্মকাণ্ডের স্মরণীয় মুহূর্তসমূহ একনজরে দেখুন।
          </p>

          {/* Admin Upload Button in Banner */}
          {isAdminLoggedIn && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer border border-emerald-300/40"
              >
                <span className="text-xl">➕</span>
                <span>নতুন ফটো আপলোড করুন (Admin)</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-10 flex-grow">
        {/* Controls: Search and Category Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ছবি খুঁজুন (শিরোনাম দিয়ে)..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-sm"
              />
              <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories Pill Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Photo Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 max-w-lg mx-auto">
            <div className="text-5xl mb-4">📷</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">কোনো ছবি পাওয়া যায়নি</h3>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery
                ? `'${searchQuery}' সম্পর্কিত কোনো ছবি পাওয়া যায়নি। অন্য কিছু সার্চ করে দেখুন।`
                : "এই ক্যাটাগরিতে এখনও কোনো ছবি যুক্ত করা হয়নি।"}
            </p>
            {isAdminLoggedIn && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <span>➕</span> নতুন ছবি যুক্ত করুন
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer transform hover:-translate-y-1 relative"
              >
                {/* Photo Thumbnail Container */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "https://placehold.co/600x400/f1f5f9/64748b?text=Invalid+Image+URL";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                  
                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 bg-blue-600/90 text-white font-bold text-xs px-3 py-1 rounded-full backdrop-blur-sm shadow">
                    {photo.category}
                  </span>

                  {/* Admin Delete Action Button */}
                  {isAdminLoggedIn && (
                    <button
                      onClick={(e) => handleDeletePhoto(photo.id, e)}
                      title="ছবি ডিলিট করুন"
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer z-10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  {/* Hover Quick View Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-white/90 text-blue-900 font-bold text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                      <span>🔍</span> বড় করে দেখুন
                    </span>
                  </div>
                </div>

                {/* Card Information */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-2">
                    <span>📅 {photo.date}</span>
                    {photo.uploadedBy && (
                      <span className="text-gray-400">👤 {photo.uploadedBy}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 text-base group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 leading-snug">
                    {photo.title}
                  </h3>
                  {photo.description && (
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mt-auto">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox / Image Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-800">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-transform hover:scale-110 cursor-pointer shadow-lg"
            >
              ✕
            </button>

            {/* Large Image Container */}
            <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[250px] md:min-h-[450px]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Photo Details Sidebar */}
            <div className="md:w-2/5 p-6 bg-white flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                    {selectedPhoto.category}
                  </span>
                  <span className="text-xs text-gray-400">📅 {selectedPhoto.date}</span>
                </div>

                <h2 className="text-xl font-extrabold text-gray-900 mb-4 leading-snug">
                  {selectedPhoto.title}
                </h2>

                <p className="text-gray-600 text-sm leading-relaxed mb-6 whitespace-pre-line">
                  {selectedPhoto.description || "এই ছবির সাথে কোনো অতিরিক্ত বিবরণ দেওয়া হয়নি।"}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  আপলোডকারী: {selectedPhoto.uploadedBy || "অ্যাডমিন"}
                </span>

                {isAdminLoggedIn && (
                  <button
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>🗑️</span> ডিলিট করুন
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload Photo Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                📷
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">গ্যালারীতে নতুন ছবি যোগ করুন</h3>
                <p className="text-xs text-gray-500">🌐 ImgBB অথবা অনলাইন ছবির লিংক এর মাধ্যমে যুক্ত করুন</p>
              </div>
            </div>

            {uploadError && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-sm mb-4">
                ⚠️ {uploadError}
              </div>
            )}

            <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
              {/* Photo Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ছবির শিরোনাম (Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: শীতবস্ত্র বিতরণ প্রোগ্রাম ২০২৬"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-gray-800 font-medium"
                />
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    ক্যাটাগরি <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategory(!isCreatingCategory);
                      if (!isCreatingCategory) {
                        setNewCategory("NEW_CATEGORY");
                      } else {
                        setNewCategory(categories[1] || "ত্রাণ বিতরণ");
                      }
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    {isCreatingCategory ? "← তালিকা থেকে বেছে নিন" : "➕ নতুন ক্যাটাগরি লিখুন"}
                  </button>
                </div>

                {isCreatingCategory ? (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="নতুন ক্যাটাগরির নাম লিখুন (যেমন: শিক্ষা সহায়তা)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-gray-800 font-medium"
                  />
                ) : (
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      if (e.target.value === "NEW_CATEGORY") {
                        setIsCreatingCategory(true);
                      } else {
                        setNewCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-gray-800 font-medium cursor-pointer"
                  >
                    {categories.filter((c) => c !== "সবগুলো").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="NEW_CATEGORY">➕ নতুন ক্যাটাগরি যোগ করুন...</option>
                  </select>
                )}
              </div>

              {/* Image URL Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ছবির লিংক (URL) <span className="text-red-500">*</span>
                </label>

                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://i.ibb.co/xxxx/photo.jpg অথবা ছবির অনলাইন লিংক"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-gray-800"
                  />
                  <p className="text-[11px] text-gray-600 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    💡 <strong>সঠিক লিংক টিপস:</strong> ImgBB-তে আপলোড করার পর নিচে <strong>Embed codes</strong> থেকে <strong>Direct link</strong> নির্বাচন করে সেটি কপি করুন (যেমন: <code className="bg-white px-1 py-0.5 rounded border border-emerald-300 font-mono text-[10px]">https://i.ibb.co/.../photo.jpg</code>)।
                  </p>
                </div>
              </div>

              {/* Preview Thumbnail */}
              {newImageUrl && (
                <div className="mt-2">
                  <span className="block text-xs font-semibold text-gray-500 mb-1">
                    ছবি প্রিভিউ:
                  </span>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={newImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image URL is broken
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>ছবি সেভ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>ছবি গ্যালারিতে প্রকাশ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
