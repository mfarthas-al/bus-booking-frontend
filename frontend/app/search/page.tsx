"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BookingResult {
  bookingCode: string;
  passengerName: string;
  phoneNumber: string;
  busNumber: string;
  route: string;
  seatNumber: number;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
}

export default function SearchBookingPage() {
  const router = useRouter();
  const [bookingCode, setBookingCode] = useState("");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const code = bookingCode.trim();
    if (!code) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSearched(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/bookings/search?bookingCode=${encodeURIComponent(code)}`
      );
      if (!res.ok) {
        setError("No booking found for that code. Please check and try again.");
        return;
      }
      const data: BookingResult = await res.json();
      setResult(data);
    } catch {
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-8 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </button>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Track Your Booking</h1>
        <p className="text-gray-500">Enter your booking code to view your ticket details</p>
      </div>

      {/* Search Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
        <label className="block text-sm font-semibold text-gray-600 mb-2">Booking Code</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.trim())}
            onKeyDown={handleKeyDown}
            placeholder="e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            className="flex-1 border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl px-4 py-3.5 text-gray-800 outline-none transition-all font-mono tracking-wide text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={!bookingCode.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 disabled:shadow-none flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Error */}
      {searched && !loading && error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6 animate-fade-in">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-slide-up">
          {/* Ticket Header */}
          <div className="bg-indigo-600 px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">Booking Code</p>
                <p className="text-white text-2xl font-bold font-mono tracking-widest">{result.bookingCode}</p>
              </div>
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Seat</p>
                <p className="text-white text-2xl font-bold">{result.seatNumber}</p>
              </div>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="relative px-8 py-0">
            <div className="border-t-2 border-dashed border-gray-200" />
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full border border-gray-200" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-100 rounded-full border border-gray-200" />
          </div>

          {/* Ticket Body */}
          <div className="px-8 py-6 space-y-5">
            {/* Route */}
            <div className="flex items-center justify-center gap-4">
              {(() => {
                const parts = result.route.split(" - ");
                const from = parts[0] ?? result.route;
                const to = parts[1] ?? "";
                return (
                  <>
                    <span className="text-xl font-bold text-gray-900">{from}</span>
                    <div className="flex items-center text-indigo-400 gap-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <div className="w-16 h-0.5 bg-indigo-200" />
                      <svg className="w-5 h-5 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-900">{to}</span>
                  </>
                );
              })()}
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-4">
              <Detail label="Passenger Name" value={result.passengerName} />
              <Detail label="Phone Number" value={result.phoneNumber} />
              <Detail label="Bus Number" value={result.busNumber} />
              <Detail label="Travel Date" value={formatDate(result.travelDate)} />
              <Detail label="Departure" value={result.departureTime} />
              <Detail label="Arrival" value={result.arrivalTime} />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-500 font-medium">Booking confirmed</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-gray-800 font-semibold text-sm">{value}</p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
