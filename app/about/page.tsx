"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { subscribeAboutData, DEFAULT_ABOUT_DATA, AboutData } from "@/lib/dbSync";

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData>(DEFAULT_ABOUT_DATA);

  useEffect(() => {
    // Initial load from localStorage if present
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aboutData");
      if (saved) {
        try {
          setAboutData({ ...DEFAULT_ABOUT_DATA, ...JSON.parse(saved) });
        } catch (e) {
          // Fallback to default
        }
      }
    }

    // Subscribe to real-time Firestore updates
    const unsubscribe = subscribeAboutData((data) => {
      setAboutData(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {aboutData.heroTitle || "আমাদের সম্পর্কে"}
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            {aboutData.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">
              {aboutData.storyTitle || "আমাদের গল্প ও পথচলা"}
            </h2>
            <div className="prose prose-lg mx-auto text-gray-600 space-y-4">
              {aboutData.storyParagraphs && aboutData.storyParagraphs.map((para, index) => (
                <p key={index} className="leading-relaxed">
                  {index === 0 && para.startsWith("এইচ") ? (
                    <>
                      <span className="text-4xl float-left mr-3 text-blue-600 font-bold">এইচ</span>
                      {para.substring(1)}
                    </>
                  ) : (
                    para
                  )}
                </p>
              ))}
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
              <h3 className="text-2xl font-bold mb-4">{aboutData.missionTitle || "আমাদের লক্ষ্য"}</h3>
              <p className="text-blue-100 leading-relaxed">
                {aboutData.missionDescription}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-2xl font-bold mb-4">{aboutData.visionTitle || "আমাদের দৃষ্টিভঙ্গি"}</h3>
              <p className="text-green-100 leading-relaxed">
                {aboutData.visionDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Work */}
      {aboutData.workItems && aboutData.workItems.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-blue-800 mb-12 text-center">
              আমরা যা করি
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {aboutData.workItems.map((item, index) => {
                const bgColors = ["bg-red-50", "bg-blue-50", "bg-green-50", "bg-purple-50", "bg-amber-50", "bg-teal-50"];
                const textColors = ["text-red-800", "text-blue-800", "text-green-800", "text-purple-800", "text-amber-800", "text-teal-800"];
                const bgClass = item.bgClass || bgColors[index % bgColors.length];
                const textClass = item.textClass || textColors[index % textColors.length];

                return (
                  <div key={item.id || index} className={`${bgClass} rounded-xl p-6 text-center hover:shadow-lg transition-shadow`}>
                    <div className="text-5xl mb-4">{item.icon || "🌟"}</div>
                    <h3 className={`font-bold text-lg ${textClass} mb-2`}>{item.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Timeline */}
      {aboutData.milestones && aboutData.milestones.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-blue-800 mb-12 text-center">
              আমাদের যাত্রা
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-blue-200 transform md:-translate-x-1/2"></div>
                
                {aboutData.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id || index}
                    className={`relative flex items-center mb-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"} pl-20 md:pl-0`}>
                      <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="text-3xl mb-2">{milestone.icon || "📍"}</div>
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
      )}

      {/* Team Section */}
      {aboutData.teamMembers && aboutData.teamMembers.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-blue-800 mb-12 text-center">
              আমাদের টিম
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {aboutData.teamMembers.map((member, index) => (
                <div key={member.id || index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                    {member.emoji || "👤"}
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{member.name}</h3>
                  <p className="text-blue-600">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  );
}
