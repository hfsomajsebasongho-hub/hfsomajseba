"use client";

import { useRef } from "react";

interface DonationReceiptProps {
  donorName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  date: string;
  senderPhone: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationReceipt({
  donorName,
  amount,
  paymentMethod,
  transactionId,
  date,
  senderPhone,
  isOpen,
  onClose,
}: DonationReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=400,width=600");
    if (printWindow && receiptRef.current) {
      printWindow.document.write("<html><head><title>দান রিসিট</title>");
      printWindow.document.write(
        "<style>" +
        "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 10px; background: white; }" +
        ".receipt { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); color: white; }" +
        ".header { text-align: center; margin-bottom: 15px; padding-bottom: 12px; border-bottom: 2px solid rgba(255,255,255,0.2); }" +
        ".logo { font-size: 28px; margin-bottom: 5px; }" +
        ".org-name { font-size: 16px; font-weight: bold; }" +
        ".org-subtitle { font-size: 11px; opacity: 0.9; }" +
        ".receipt-title { font-size: 14px; font-weight: bold; color: #4ade80; text-align: center; margin-bottom: 12px; }" +
        ".section { margin: 10px 0; }" +
        ".field { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }" +
        ".field-label { opacity: 0.9; }" +
        ".field-value { font-weight: 600; }" +
        ".amount-section { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; margin: 12px 0; text-align: center; }" +
        ".amount-label { font-size: 11px; opacity: 0.9; }" +
        ".amount-value { font-size: 22px; font-weight: bold; color: #4ade80; margin: 5px 0; }" +
        ".footer { text-align: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; opacity: 0.85; }" +
        "@media print { body { margin: 0; padding: 0; } }" +
        "</style>"
      );
      printWindow.document.write("</head><body>");
      printWindow.document.write(receiptRef.current.innerHTML);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    if (receiptRef.current) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const width = 600;
      const height = 500;
      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "#1e40af");
        gradient.addColorStop(1, "#1e3a8a");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // White text
        ctx.fillStyle = "white";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🤝", width / 2, 40);
        ctx.font = "bold 14px Arial";
        ctx.fillText("হিলফুল ফুজুল", width / 2, 62);
        ctx.font = "10px Arial";
        ctx.fillText("সমাজসেবা সংঘ", width / 2, 78);

        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "#4ade80";
        ctx.fillText("দান রিসিট", width / 2, 105);

        ctx.fillStyle = "white";
        let yPosition = 135;
        const lineHeight = 30;

        const data = [
          { label: "দাতার নাম", value: donorName },
          { label: "টাকা", value: `৳${amount.toLocaleString("bn-BD")}` },
          { label: "পদ্ধতি", value: paymentMethod },
          { label: "ট্রানজেকশন", value: transactionId.substring(0, 15) + (transactionId.length > 15 ? "..." : "") },
          { label: "তারিখ", value: date },
        ];

        ctx.font = "11px Arial";
        ctx.textAlign = "left";
        data.forEach((item) => {
          ctx.fillText(`${item.label}:`, 50, yPosition);
          ctx.textAlign = "right";
          ctx.fillText(item.value, width - 50, yPosition);
          ctx.textAlign = "left";
          yPosition += lineHeight;
        });

        ctx.font = "10px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.textAlign = "center";
        ctx.fillText("ধন্যবাদ আপনার অবদানের জন্য", width / 2, height - 20);

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `receipt-${Date.now()}.png`;
        link.click();
      }
    }
  };

  const receiptNumber = `REC-${Date.now()}`.slice(0, 15);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">📄 দান রিসিট</h2>
          <button
            onClick={onClose}
            className="text-white text-2xl hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div ref={receiptRef} className="bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-xl p-4">
            {/* Logo & Header */}
            <div className="text-center mb-3 pb-3 border-b border-white/20">
              <div className="text-3xl mb-1">🤝</div>
              <h1 className="text-sm font-bold">HF সমাজসেবা সংঘ</h1>
              <h3 className="text-xs font-bold text-green-300 mt-2">✓ দান রিসিট</h3>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="opacity-90">দাতার নাম:</span>
                <span className="font-semibold">{donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">নম্বর:</span>
                <span className="font-semibold">{senderPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">পদ্ধতি:</span>
                <span className="font-semibold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">ট্রানজেকশন:</span>
                <span className="font-mono text-xs">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">তারিখ:</span>
                <span className="font-semibold">{date}</span>
              </div>
            </div>

            {/* Amount Box */}
            <div className="bg-white/15 rounded-lg p-3 my-3 text-center border border-white/30">
              <p className="text-xs opacity-90 mb-1">দান করা পরিমাণ</p>
              <p className="text-2xl font-bold text-green-300">৳ {amount.toLocaleString("bn-BD")}</p>
            </div>

            {/* Footer */}
            <div className="text-center text-xs opacity-85 pt-2 border-t border-white/20">
              <p className="mb-1">ধন্যবাদ আপনার মূল্যবান অবদানের জন্য</p>
              <p className="text-xs opacity-75">রিসিট #{receiptNumber}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 p-3 flex gap-3 justify-center border-t">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-1"
          >
            🖨️ প্রিন্ট
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-1"
          >
            📥 ডাউনলোড
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            বন্ধ
          </button>
        </div>
      </div>
    </div>
  );
}
