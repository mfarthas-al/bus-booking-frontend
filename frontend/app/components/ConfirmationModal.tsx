"use client";

import { useRef } from "react";

interface BookingData {
  bookingCode: string;
  busNumber: string;
  route: string;
  seatNumber: string;
  departureTime: string;
  arrivalTime: string;
  passengerName: string;
  phoneNumber: string;
}

export default function ConfirmationModal({
  booking,
  onClose,
}: {
  booking: BookingData;
  onClose: () => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const downloadReceipt = () => {
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Receipt - ${booking.bookingCode}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; background: #f0f4f8; }
    .receipt { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #4f46e5; margin: 0 0 4px; font-size: 24px; }
    .header p { color: #64748b; margin: 0; font-size: 14px; }
    .booking-code { text-align: center; background: #eef2ff; padding: 12px; border-radius: 8px; margin-bottom: 20px; }
    .booking-code span { font-size: 22px; font-weight: 700; color: #4f46e5; letter-spacing: 2px; }
    .details { margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748b; font-size: 14px; }
    .value { font-weight: 600; color: #1e293b; font-size: 14px; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #e2e8f0; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>🚌 BusBook</h1>
      <p>Booking Confirmation Receipt</p>
    </div>
    <div class="booking-code">
      <span>${booking.bookingCode}</span>
    </div>
    <div class="details">
      <div class="row"><span class="label">Passenger</span><span class="value">${booking.passengerName}</span></div>
      <div class="row"><span class="label">Phone</span><span class="value">${booking.phoneNumber}</span></div>
      <div class="row"><span class="label">Route</span><span class="value">${booking.route}</span></div>
      <div class="row"><span class="label">Bus Number</span><span class="value">${booking.busNumber}</span></div>
      <div class="row"><span class="label">Seat</span><span class="value">${booking.seatNumber}</span></div>
      <div class="row"><span class="label">Departure</span><span class="value">${booking.departureTime}</span></div>
      <div class="row"><span class="label">Arrival</span><span class="value">${booking.arrivalTime}</span></div>
    </div>
    <div class="footer">
      <p>Thank you for choosing BusBook!</p>
      <p>Please show this receipt when boarding.</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${booking.bookingCode}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden">
        {/* Success Header */}
        <div className="bg-linear-to-r from-emerald-500 to-green-500 px-6 py-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="text-emerald-100 mt-1 text-sm">Your seat has been reserved successfully</p>
        </div>

        {/* Booking Details */}
        <div className="px-6 py-5" ref={receiptRef}>
          <div className="bg-indigo-50 rounded-xl p-3 text-center mb-5">
            <span className="text-xs text-indigo-500 font-medium">Booking Code</span>
            <p className="text-xl font-bold text-indigo-700 tracking-widest mt-1">
              {booking.bookingCode}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Passenger", value: booking.passengerName },
              { label: "Route", value: booking.route },
              { label: "Bus", value: booking.busNumber },
              { label: "Seat", value: booking.seatNumber },
              { label: "Departure", value: booking.departureTime },
              { label: "Arrival", value: booking.arrivalTime },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={downloadReceipt}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
