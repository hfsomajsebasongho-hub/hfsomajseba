import DonationForm from "../components/DonationForm";

export default function DonatePage() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            💝 দান করুন
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            আপনার দানে একটি পরিবারের মুখে হাসি ফুটতে পারে।
            সহজেই আপনার পছন্দের মাধ্যমে দান করুন।
          </p>
        </div>

        {/* Donation Form */}
        <DonationForm />

        {/* Why Donate Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-8">
            কেন দান করবেন?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">১০০% স্বচ্ছতা</h3>
              <p className="text-gray-600">
                প্রতিটি টাকার হিসাব আমরা জনসমক্ষে প্রকাশ করি
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">🤲</div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">সরাসরি সাহায্য</h3>
              <p className="text-gray-600">
                আপনার দান সরাসরি প্রয়োজনে থাকা মানুষের কাছে পৌঁছায়
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">নিয়মিত রিপোর্ট</h3>
              <p className="text-gray-600">
                আপনার দান কোথায় ব্যয় হচ্ছে তা জানাই আমরা
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
              <span className="text-green-600">✓</span>
              <span className="text-green-800 font-medium">নিরাপদ পেমেন্ট</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
              <span className="text-blue-600">✓</span>
              <span className="text-blue-800 font-medium">সরকার নিবন্ধিত</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
              <span className="text-purple-600">✓</span>
              <span className="text-purple-800 font-medium">৫ বছরের অভিজ্ঞতা</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
