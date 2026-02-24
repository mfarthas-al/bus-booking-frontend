"use client";

import {  useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StepIndicator from "./components/StepIndicator";

export default function Home() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchSchedules = () => {
    if (!selectedDate) return;
    setLoading(true);
    setSearched(true);
    fetch(`http://localhost:8080/api/schedules/by-date?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setSchedules(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSelectSchedule = (schedule: any) => {
    // Store schedule info for the next page
    localStorage.setItem("selectedSchedule", JSON.stringify(schedule));
    router.push(`/seats/${schedule.id}`);
  };

  // Get today's date in YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="animate-fade-in">
      <StepIndicator currentStep={1} />

      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Find Your <span className="text-indigo-600">Bus</span>
        </h1>
        <p className="text-gray-500 text-lg">Select a travel date to browse available schedules</p>
      </div>

      {/* Date Picker Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-10 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-600 mb-2">Travel Date</label>
            <input
              type="date"
              min={today}
              className="w-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 rounded-xl p-3.5 text-gray-800 outline-none transition-all text-lg"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button
            onClick={fetchSchedules}
            disabled={!selectedDate || loading}
            className="w-full sm:w-auto sm:mt-7 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
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

      {/* Track Booking CTA */}
      <div className="flex justify-center mb-10">
        <Link
          href="/search"
          className="flex items-center gap-2.5 bg-white border-2 border-indigo-100 hover:border-indigo-400 text-indigo-600 hover:text-indigo-700 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Already booked? Track your booking
        </Link>
      </div>

      {/* Schedules List */}
      {searched && !loading && schedules.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
          </svg>
          <p className="text-gray-400 text-lg font-medium">No schedules found for this date</p>
          <p className="text-gray-400 text-sm mt-1">Try selecting a different date</p>
        </div>
      )}

      {schedules.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Available Schedules
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({schedules.length} found)
            </span>
          </h2>

          {schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  {/* Route */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {schedule.bus.fromCity}
                    </span>
                    <div className="flex items-center text-indigo-400">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <div className="w-12 h-0.5 bg-indigo-200" />
                      <svg className="w-5 h-5 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {schedule.bus.toCity}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Bus: <strong className="text-gray-700">{schedule.bus.busNumber}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {schedule.departureTime} → {schedule.arrivalTime}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectSchedule(schedule)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
                >
                  Select Seats →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
