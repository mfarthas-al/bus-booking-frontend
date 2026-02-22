"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StepIndicator from "../../components/StepIndicator";

export default function SeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params.scheduleId as string;

  const [schedule, setSchedule] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get schedule from localStorage
    const stored = localStorage.getItem("selectedSchedule");
    if (stored) {
      setSchedule(JSON.parse(stored));
    }

    // Fetch seats
    fetch(`http://localhost:8080/api/seats?scheduleId=${scheduleId}`)
      .then((res) => res.json())
      .then((data) => {
        setSeats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [scheduleId]);

  const handleContinue = () => {
    if (!selectedSeat) return;
    localStorage.setItem("selectedSeat", JSON.stringify(selectedSeat));
    router.push(`/booking/${scheduleId}`);
  };

  const bookedCount = seats.filter((s) => s.isBooked).length;
  const availableCount = seats.filter((s) => !s.isBooked).length;

  return (
    <div className="animate-fade-in">
      <StepIndicator currentStep={2} />

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 cursor-pointer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to schedules
      </button>

      {/* Schedule Info Card */}
      {schedule && (
        <div className="bg-linear-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl font-bold">{schedule.bus.fromCity}</span>
                <span className="text-indigo-200">→</span>
                <span className="text-xl font-bold">{schedule.bus.toCity}</span>
              </div>
              <div className="flex items-center gap-4 text-indigo-100 text-sm">
                <span>Bus: {schedule.bus.busNumber}</span>
                <span>{schedule.departureTime} - {schedule.arrivalTime}</span>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold">{availableCount}</p>
                <p className="text-indigo-100 text-xs">Available</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold">{bookedCount}</p>
                <p className="text-indigo-100 text-xs">Booked</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Seat</h2>
      <p className="text-gray-500 mb-6">Click on an available seat to select it</p>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-100 border-2 border-emerald-400" />
          <span className="text-sm text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-indigo-500" />
          <span className="text-sm text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200" />
          <span className="text-sm text-gray-600">Booked</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="w-10 h-10 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <>
          {/* Bus Layout */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 max-w-lg mx-auto">
            {/* Driver section */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-dashed border-gray-200">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-400 font-medium">Driver</span>
            </div>

            {/* Seats Grid */}
            <div className="grid grid-cols-4 gap-3">
              {seats.map((seat, index) => {
                const isAisle = (index % 4) === 2;
                return (
                  <div key={seat.id} className={isAisle ? "col-start-3" : ""}>
                    <button
                      onClick={() => !seat.isBooked && setSelectedSeat(seat)}
                      disabled={seat.isBooked}
                      className={`
                        w-full aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all duration-200 cursor-pointer
                        ${
                          seat.isBooked
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : selectedSeat?.id === seat.id
                              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200 scale-105"
                              : "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                        }
                      `}
                    >
                      {seat.isBooked ? (
                        <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : selectedSeat?.id === seat.id ? (
                        <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                      {seat.seatNumber}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Continue Button */}
          <div className="max-w-lg mx-auto">
            {selectedSeat && (
              <div className="bg-indigo-50 rounded-xl p-4 mb-4 flex items-center justify-between animate-fade-in">
                <div>
                  <span className="text-sm text-indigo-500">Selected Seat</span>
                  <p className="text-xl font-bold text-indigo-700">Seat {selectedSeat.seatNumber}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleContinue}
              disabled={!selectedSeat}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-200 disabled:shadow-none cursor-pointer"
            >
              {selectedSeat ? "Continue to Details →" : "Select a seat to continue"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
