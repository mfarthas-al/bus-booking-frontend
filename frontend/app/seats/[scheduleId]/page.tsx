"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { useParams, useRouter } from "next/navigation";
import StepIndicator from "../../components/StepIndicator";

function SteeringWheelIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="9" x2="12" y2="2" />
      <line x1="9" y1="11.5" x2="2.5" y2="15" />
      <line x1="15" y1="11.5" x2="21.5" y2="15" />
    </svg>
  );
}

export default function SeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params.scheduleId as string;

  const [schedule, setSchedule] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("selectedSchedule");
    if (stored) setSchedule(JSON.parse(stored));

    fetch(`http://localhost:8080/api/seats?scheduleId=${scheduleId}`)
      .then((res) => res.json())
      .then((data) => {
        setSeats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [scheduleId]);

  const handleSeatClick = (seat: any) => {
    const status = seat.status?.toUpperCase();
    if (status !== "AVAILABLE") return;
    setSelectedSeat(seat);
  };

  const handleContinue = () => {
    if (!selectedSeat) return;
    localStorage.setItem("selectedSeat", JSON.stringify(selectedSeat));
    router.push(`/booking/${scheduleId}`);
  };

  const availableCount = seats.filter((s) => s.status?.toUpperCase() === "AVAILABLE").length;
  const reservedCount  = seats.filter((s) => s.status?.toUpperCase() === "RESERVED").length;
  const bookedCount    = seats.filter((s) => s.status?.toUpperCase() === "BOOKED").length;

  const getSeatStyle = (seat: any): React.CSSProperties => {
    const status = seat.status?.toUpperCase();
    if (selectedSeat?.id === seat.id)
      return { backgroundColor: "#6366f1", color: "#fff", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" };
    if (status === "BOOKED")
      return { backgroundColor: "#ef4444", color: "#fff", opacity: 0.85, cursor: "not-allowed" };
    if (status === "RESERVED")
      return { backgroundColor: "#f97316", color: "#1a1a1a", opacity: 0.85, cursor: "not-allowed" };
    return { backgroundColor: "#dcfce7", color: "#166534", border: "2px solid #86efac", cursor: "pointer" };
  };

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
                <span className="text-indigo-200"></span>
                <span className="text-xl font-bold">{schedule.bus.toCity}</span>
              </div>
              <div className="flex items-center gap-4 text-indigo-100 text-sm">
                <span>Bus: {schedule.bus.busNumber}</span>
                <span>{schedule.departureTime} - {schedule.arrivalTime}</span>
              </div>
            </div>
            <div className="flex gap-3 text-sm flex-wrap">
              <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold">{availableCount}</p>
                <p className="text-indigo-100 text-xs">Available</p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold">{reservedCount}</p>
                <p className="text-indigo-100 text-xs">Reserved</p>
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-4 max-w-lg mx-auto">
            {/* Driver row */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-dashed border-gray-200 justify-center">
              <div className="w-16 h-8" />
              <div className="w-16 h-8" />
              <div className="w-8" />
              <div className="w-16 h-8" />
              <div className="w-16 h-8 flex items-center justify-center">
                <SteeringWheelIcon className="w-8 h-8 text-gray-500" />
              </div>
            </div>

            {/* Seat Grid  [A][B] | aisle | [C][D] per row */}
            <div className="flex flex-col gap-4 items-center">
              {Array.from({ length: Math.ceil(seats.length / 4) }, (_, rowIndex) => {
                const row = seats.slice(rowIndex * 4, rowIndex * 4 + 4);
                return (
                  <div key={rowIndex} className="flex items-center gap-4">
                    {[row[0], row[1]].map((seat, i) =>
                      seat ? (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          style={getSeatStyle(seat)}
                          className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all duration-150"
                        >
                          {selectedSeat?.id === seat.id && (
                            <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {seat.status?.toUpperCase() === "BOOKED" && selectedSeat?.id !== seat.id && (
                            <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {seat.seatNumber}
                        </button>
                      ) : (
                        <div key={`el-${rowIndex}-${i}`} className="w-16 h-16" />
                      )
                    )}
                    <div className="w-8" />
                    {[row[2], row[3]].map((seat, i) =>
                      seat ? (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          style={getSeatStyle(seat)}
                          className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all duration-150"
                        >
                          {selectedSeat?.id === seat.id && (
                            <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {seat.status?.toUpperCase() === "BOOKED" && selectedSeat?.id !== seat.id && (
                            <svg className="w-4 h-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {seat.seatNumber}
                        </button>
                      ) : (
                        <div key={`er-${rowIndex}-${i}`} className="w-16 h-16" />
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Legend */}
          <div className="max-w-lg mx-auto mb-6 flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600 bg-white rounded-xl shadow px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded inline-block" style={{ backgroundColor: "#dcfce7", border: "2px solid #86efac" }} />
              Available
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded inline-block" style={{ backgroundColor: "#6366f1" }} />
              Selected
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded inline-block" style={{ backgroundColor: "#f97316" }} />
              Reserved
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded inline-block" style={{ backgroundColor: "#ef4444" }} />
              Booked
            </div>
            <div className="flex items-center gap-2">
              <SteeringWheelIcon className="w-5 h-5 text-gray-500" />
              Driver
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
              {selectedSeat ? "Continue to Details " : "Select a seat to continue"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
