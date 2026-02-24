"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StepIndicator from "../../components/StepIndicator";
import ConfirmationModal from "../../components/ConfirmationModal";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params.scheduleId as string;

  const [schedule, setSchedule] = useState<any>(null);
  const [seat, setSeat] = useState<any>(null);
  const [passengerName, setPassengerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const storedSchedule = localStorage.getItem("selectedSchedule");
    const storedSeat = localStorage.getItem("selectedSeat");

    if (storedSchedule) setSchedule(JSON.parse(storedSchedule));
    if (storedSeat) {
      const parsedSeat = JSON.parse(storedSeat);
      // If seat is no longer AVAILABLE (e.g. reserved/booked between steps), go back
      if (parsedSeat.status?.toUpperCase() !== "AVAILABLE") {
        router.push(`/seats/${scheduleId}`);
        return;
      }
      setSeat(parsedSeat);
    }

    // Redirect if missing data
    if (!storedSchedule || !storedSeat) {
      router.push("/");
    }
  }, [router]);

  const validate = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!passengerName.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(passengerName.trim())) {
      newErrors.name = "Name must contain letters only";
    }

    // phoneNumber state holds only the 8 digits after "07"
    if (!phoneNumber.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{8}$/.test(phoneNumber)) {
      newErrors.phone = "Enter the remaining 8 digits after 07";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = () => {
    if (!validate()) return;
    setShowConfirm(true);
  };

  const executeBooking = () => {
    setShowConfirm(false);
    setLoading(true);

    const fullPhone = "07" + phoneNumber;
    fetch(
      `http://localhost:8080/api/bookings?seatId=${seat.id}&passengerName=${encodeURIComponent(passengerName)}&phoneNumber=${encodeURIComponent(fullPhone)}`,  
      { method: "POST" }
    )
      .then((res) => res.json())
      .then((data) => {
        setBookingResult(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleModalClose = () => {
    // Clear stored data and go home
    localStorage.removeItem("selectedSchedule");
    localStorage.removeItem("selectedSeat");
    router.push("/");
  };

  if (!schedule || !seat) {
    return (
      <div className="flex justify-center py-16">
        <svg className="w-10 h-10 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <StepIndicator currentStep={3} />

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to seat selection
      </button>

      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Passenger Details</h2>
        <p className="text-gray-500 mb-8">Fill in your information to complete the booking</p>

        {/* Booking Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Booking Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <span className="text-xs text-gray-400 font-medium">Route</span>
              <p className="font-bold text-gray-800 mt-1">
                {schedule.bus.fromCity} → {schedule.bus.toCity}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <span className="text-xs text-gray-400 font-medium">Bus</span>
              <p className="font-bold text-gray-800 mt-1">{schedule.bus.busNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <span className="text-xs text-gray-400 font-medium">Schedule</span>
              <p className="font-bold text-gray-800 mt-1">
                {schedule.departureTime} - {schedule.arrivalTime}
              </p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
              <span className="text-xs text-indigo-400 font-medium">Seat</span>
              <p className="font-bold text-indigo-700 text-xl mt-1">{seat.seatNumber}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => {
                  // Only allow letters and spaces
                  const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                  setPassengerName(val);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Enter your full name"
                className={`w-full border-2 rounded-xl p-4 outline-none transition-all text-gray-800 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                }`}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-all ${
                  errors.phone
                    ? "border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100"
                    : "border-gray-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100"
                }`}>
                <span className="px-4 py-4 bg-gray-100 text-gray-600 font-bold text-sm select-none border-r-2 border-gray-200">
                  07
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    // Only allow digits, max 8
                    const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                    setPhoneNumber(val);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="XXXXXXXX"
                  maxLength={8}
                  className="flex-1 p-4 outline-none text-gray-800 bg-white"
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full bg-linear-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-200 disabled:shadow-none flex items-center justify-center gap-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {bookingResult && bookingResult.data && (
        <ConfirmationModal
          booking={{
            bookingCode: bookingResult.data.bookingCode,
            busNumber: bookingResult.data.busNumber,
            route: bookingResult.data.route,
            seatNumber: bookingResult.data.seatNumber,
            departureTime: bookingResult.data.departureTime,
            arrivalTime: bookingResult.data.arrivalTime,
            passengerName: passengerName,
            phoneNumber: phoneNumber,
          }}
          onClose={handleModalClose}
        />
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Confirm Your Booking"
        message={`Book seat ${seat?.seatNumber} for ${passengerName || "passenger"}?`}
        confirmLabel="Yes, Book Now"
        onConfirm={executeBooking}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
