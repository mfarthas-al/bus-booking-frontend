"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { useParams } from "next/navigation";

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

export default function AdminSeatPage() {
  const { scheduleId } = useParams();
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [changeMode, setChangeMode] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null);
  const [pendingChangeSeat, setPendingChangeSeat] = useState<any>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("adminToken")
      : null;

  const fetchSeats = async () => {
    const res = await fetch(
      `http://localhost:8080/api/seats?scheduleId=${scheduleId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    setSeats(data);
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  useEffect(() => {
    if (showModal) {
      requestAnimationFrame(() => setModalVisible(true));
    }
  }, [showModal]);

  const openModal = async (seat: any) => {
    const status = seat.status?.toUpperCase();
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    if (status === "BOOKED") {
      const res = await fetch(
        `http://localhost:8080/api/admin/bookings/by-seat/${seat.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const bookingId = await res.json();
      setCurrentBookingId(bookingId);
    }

    setSelectedSeat({ ...seat, status });
    setShowModal(true);
  };

  const cancelBooking = async () => {
    if (!currentBookingId) return;
    await fetch(`http://localhost:8080/api/admin/bookings/${currentBookingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCurrentBookingId(null);
    closeModal();
    fetchSeats();
  };

  const startChangeSeat = () => {
    setChangeMode(true);
    closeModal();
  };

  const handleSeatChange = (seat: any) => {
    if (!changeMode || !currentBookingId) return;
    if (seat.status?.toUpperCase() !== "AVAILABLE") return;
    setPendingChangeSeat(seat);
  };

  const confirmSeatChange = async () => {
    if (!pendingChangeSeat || !currentBookingId) return;
    await fetch(
      `http://localhost:8080/api/admin/bookings/${currentBookingId}/change-seat`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newSeatId: pendingChangeSeat.id }),
      }
    );
    setChangeMode(false);
    setCurrentBookingId(null);
    setPendingChangeSeat(null);
    fetchSeats();
  };

  const closeModal = () => {
    setModalVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setShowModal(false);
      setSelectedSeat(null);
    }, 180);
  };

  const updateSeat = async (action: string) => {
    const seatId = selectedSeat.id;
    const newStatus = action === "reserve" ? "RESERVED" : "AVAILABLE";
    setSeats((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, status: newStatus } : s))
    );
    closeModal();
    try {
      await fetch(
        `http://localhost:8080/api/admin/seats/${seatId}/${action}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch {
      await fetchSeats();
    }
  };

  const getSeatColor = (status: string): React.CSSProperties => {
    const s = status?.toUpperCase();
    if (s === "BOOKED")   return { backgroundColor: "#ef4444", color: "#fff", opacity: 0.9 };
    if (s === "RESERVED") return { backgroundColor: "#f97316", color: "#1a1a1a" };
    return { backgroundColor: "#dcfce7", color: "#166534", border: "2px solid #86efac" };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Seat Management</h1>

      {changeMode && (
        <div className="max-w-lg mx-auto mb-4 bg-yellow-100 text-yellow-800 p-3 rounded-xl text-center font-semibold flex items-center justify-between">
          <span>Select an AVAILABLE seat to complete the seat change</span>
          <button
            onClick={() => { setChangeMode(false); setCurrentBookingId(null); }}
            className="ml-4 text-yellow-700 underline text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-lg mx-auto">

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

        {/* Seat Grid */}
        <div className="flex flex-col gap-4 items-center">
          {Array.from({ length: Math.ceil(seats.length / 4) }, (_, rowIndex) => {
            const row = seats.slice(rowIndex * 4, rowIndex * 4 + 4);
            return (
              <div key={rowIndex} className="flex items-center gap-4">
                {[row[0], row[1]].map((seat, i) =>
                  seat ? (
                    <button
                      key={seat.id}
                      onClick={() => changeMode ? handleSeatChange(seat) : openModal(seat)}
                      style={getSeatColor(seat.status)}
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer"
                    >
                      {seat.seatNumber}
                    </button>
                  ) : <div key={`el-${rowIndex}-${i}`} className="w-16 h-16" />
                )}
                <div className="w-8" />
                {[row[2], row[3]].map((seat, i) =>
                  seat ? (
                    <button
                      key={seat.id}
                      onClick={() => changeMode ? handleSeatChange(seat) : openModal(seat)}
                      style={getSeatColor(seat.status)}
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer"
                    >
                      {seat.seatNumber}
                    </button>
                  ) : <div key={`er-${rowIndex}-${i}`} className="w-16 h-16" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Legend */}
      <div className="max-w-lg mx-auto mt-4 flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600 bg-white rounded-xl shadow px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded inline-block" style={{ backgroundColor: "#dcfce7", border: "2px solid #86efac" }} />
          Available
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

      {/* Modal */}
      {showModal && selectedSeat && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: `rgba(0,0,0,${modalVisible ? 0.45 : 0})`,
            transition: "background-color 180ms ease",
          }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl p-6 w-80 shadow-xl"
            style={{
              transform: modalVisible ? "scale(1)" : "scale(0.9)",
              opacity: modalVisible ? 1 : 0,
              transition: "transform 180ms cubic-bezier(.34,1.56,.64,1), opacity 150ms ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-1 text-center">
              Seat {selectedSeat.seatNumber}
            </h2>
            <p className="text-center text-sm text-gray-400 mb-5">
              Status:{" "}
              <span style={{ color: selectedSeat.status === "RESERVED" ? "#f97316" : "#16a34a", fontWeight: 600 }}>
                {selectedSeat.status}
              </span>
            </p>

            <div className="flex flex-col gap-3">
              {selectedSeat.status === "AVAILABLE" && (
                <button
                  onClick={() => updateSeat("reserve")}
                  style={{ backgroundColor: "#f97316", color: "#fff" }}
                  className="py-2 rounded-lg font-semibold hover:opacity-90"
                >
                  Mark as Reserved
                </button>
              )}
              {selectedSeat.status === "RESERVED" && (
                <button
                  onClick={() => updateSeat("available")}
                  style={{ backgroundColor: "#22c55e", color: "#fff" }}
                  className="py-2 rounded-lg font-semibold hover:opacity-90"
                >
                  Cancel Reservation
                </button>
              )}
              {selectedSeat.status === "BOOKED" && (
                <>
                  <button
                    onClick={startChangeSeat}
                    style={{ backgroundColor: "#3b82f6", color: "#fff" }}
                    className="py-2 rounded-lg font-semibold hover:opacity-90"
                  >
                    Change Seat
                  </button>
                  <button
                    onClick={cancelBooking}
                    style={{ backgroundColor: "#ef4444", color: "#fff" }}
                    className="py-2 rounded-lg font-semibold hover:opacity-90"
                  >
                    Cancel Booking
                  </button>
                </>
              )}
              <button
                onClick={closeModal}
                className="text-gray-400 mt-1 text-sm hover:text-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Seat Change Confirm Modal */}
      {pendingChangeSeat && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", transition: "background-color 180ms ease" }}
          onClick={() => setPendingChangeSeat(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-80 shadow-xl"
            style={{ transform: "scale(1)", opacity: 1, transition: "transform 180ms cubic-bezier(.34,1.56,.64,1), opacity 150ms ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2 text-center">Confirm Seat Change</h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Move booking to seat <span className="font-bold text-gray-800">{pendingChangeSeat.seatNumber}</span>?<br />
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingChangeSeat(null)}
                className="flex-1 py-2 rounded-lg font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSeatChange}
                style={{ backgroundColor: "#3b82f6", color: "#fff" }}
                className="flex-1 py-2 rounded-lg font-semibold hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
