import Link from "next/link";

export default function AboutPage() {
  const teamMembers = [
    { name: "মোহাম্মদ আলী", role: "প্রতিষ্ঠাতা ও চেয়ারম্যান", emoji: "👨‍💼" },
    { name: "ফাতিমা জামান", role: "সাধারণ সম্পাদক", emoji: "👩‍💼" },
    { name: "কামাল হোসেন", role: "অর্থ সচিব", emoji: "👨‍💼" },
    { name: "রুবিনা আক্তার", role: "প্রচার সম্পাদক", emoji: "👩‍💼" },
  ];

  const milestones = [
    { year: "২০২১", event: "সংগঠন প্রতিষ্ঠা", icon: "🎉" },
    { year: "২০২২", event: "১০০ পরিবারকে সাহায্য", icon: "🏠" },
    { year: "২০২৩", event: "শিক্ষা বৃত্তি প্রকল্প শুরু", icon: "📚" },
    { year: "২০২৪", event: "চিকিৎসা সহায়তা কার্যক্রম", icon: "🏥" },
    { year: "২০২৫", event: "১০০০ পরিবার সাহায্যপ্রাপ্ত", icon: "🎊" },
    { year: "২০২৬", event: "নতুন প্রকল্প শুরু", icon: "🚀" },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            আমাদের সম্পর্কে
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            HF সমাজসেবা সংঘ সমাজের অসহায় ও দুঃস্থ মানুষদের সেবায় নিবেদিত
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">
              আমাদের গল্প
            </h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="mb-4 leading-relaxed">
                <span className="text-4xl float-left mr-3 text-blue-600">হি</span>
                লফুল ফুজুল - এই নামটি ইতিহাসের এক গৌরবময় অধ্যায় থেকে অনুপ্রাণিত।
                মক্কায় নবী মুহাম্মদ (সা.) এর যৌবনকালে গঠিত এই সংগঠন দুর্বল ও নির্যাতিত
                মানুষদের পাশে দাঁড়াতে প্রতিশ্রুতিবদ্ধ ছিল।
              </p>
              <p className="mb-4 leading-relaxed">
                সেই মহান আদর্শ থেকে অনুপ্রাণিত হয়ে ২০২১ সালে আমরা এই সংগঠনটি প্রতিষ্ঠা করি।
                আমাদের লক্ষ্য হলো সমাজের অসহায়, দুঃস্থ ও দরিদ্র মানুষদের পাশে দাঁড়ানো এবং
                তাদের জীবনমান উন্নয়নে সহায়তা করা।
              </p>
              <p className="leading-relaxed">
                গত ৫ বছরে আমরা ১০০০+ পরিবারকে সাহায্য করেছি এবং আপনাদের সহযোগিতায়
                আমরা আরও বহু মানুষের জীবনে পরিবর্তন আনতে সক্ষম হব।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4">আমাদের লক্ষ্য</h3>
              <p className="text-blue-100 leading-relaxed">
                সমাজের প্রতিটি অসহায় ও দুঃস্থ মানুষের পাশে দাঁড়ানো এবং তাদের
                মৌলিক চাহিদা পূরণে সহায়তা করা। শিক্ষা, চিকিৎসা ও খাদ্য সহায়তার
                মাধ্যমে একটি সুন্দর সমাজ গড়ে তোলা।
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-2xl font-bold mb-4">আমাদের দৃষ্টিভঙ্গি</h3>
              <p className="text-green-100 leading-relaxed">
                এমন একটি সমাজ গড়ে তোলা যেখানে কেউ অসহায় নয়, কেউ ক্ষুধার্ত নয়,
                সবার শিক্ষা ও চিকিৎসার সুযোগ আছে। যেখানে মানুষ মানুষের পাশে দাঁড়ায়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Work */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-800 mb-12 text-center">
            আমরা যা করি
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-red-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🍚</div>
              <h3 className="font-bold text-lg text-red-800 mb-2">খাদ্য সহায়তা</h3>
              <p className="text-gray-600 text-sm">
                দরিদ্র পরিবারগুলোকে নিয়মিত খাদ্য সামগ্রী বিতরণ করি
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="font-bold text-lg text-blue-800 mb-2">শিক্ষা বৃত্তি</h3>
              <p className="text-gray-600 text-sm">
                মেধাবী ও দরিদ্র ছাত্র-ছাত্রীদের বৃত্তি প্রদান করি
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🏥</div>
              <h3 className="font-bold text-lg text-green-800 mb-2">চিকিৎসা সেবা</h3>
              <p className="text-gray-600 text-sm">
                অসুস্থ ও দরিদ্রদের চিকিৎসা খরচ বহন করি
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">👗</div>
              <h3 className="font-bold text-lg text-purple-800 mb-2">বস্ত্র বিতরণ</h3>
              <p className="text-gray-600 text-sm">
                শীতকালে গরম কাপড় ও ঈদে নতুন পোশাক বিতরণ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-800 mb-12 text-center">
            আমাদের যাত্রা
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-blue-200 transform md:-translate-x-1/2"></div>
              
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center mb-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"} pl-20 md:pl-0`}>
                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <div className="text-3xl mb-2">{milestone.icon}</div>
                      <h3 className="font-bold text-blue-600 text-lg">{milestone.year}</h3>
                      <p className="text-gray-700">{milestone.event}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-blue-600 rounded-full transform md:-translate-x-1/2 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-blue-800 mb-12 text-center">
            আমাদের টিম
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                  {member.emoji}
                </div>
                <h3 className="font-bold text-lg text-gray-800">{member.name}</h3>
                <p className="text-blue-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            আমাদের সাথে যুক্ত হোন
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            আপনার সামান্য সাহায্যে আমরা অনেক মানুষের জীবন বদলে দিতে পারি
          </p>
          <Link
            href="/donate"
            className="inline-block bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 px-10 rounded-full text-lg transition-all hover:scale-105 shadow-lg"
          >
            💝 এখনই দান করুন
          </Link>
        </div>
      </section>
    </div>
  );
}
