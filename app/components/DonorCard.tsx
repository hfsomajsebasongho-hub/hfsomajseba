interface DonorCardProps {
  name: string;
  amount: number;
  date: string;
  image?: string;
  isAnonymous?: boolean;
  bloodGroup?: string;
}

export default function DonorCard({ name, amount, date, image, isAnonymous, bloodGroup }: DonorCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {isAnonymous ? "?" : (image ? (
            <img src={image} alt={name} className="w-full h-full rounded-full object-cover" />
          ) : (
            name.charAt(0)
          ))}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">
            {isAnonymous ? "বেনামী দাতা" : name}
          </h3>
          <p className="text-green-600 font-bold text-xl">৳ {amount.toLocaleString('bn-BD')}</p>
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <span>{date}</span>
            {bloodGroup && (
              <>
                <span>•</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold text-xs">
                  {bloodGroup}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-4xl">
          💝
        </div>
      </div>
    </div>
  );
}
