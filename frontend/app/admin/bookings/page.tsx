"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; message: string;
    confirmLabel: string; danger: boolean; onConfirm: () => void;
  }>({ open: false, title: "", message: "", confirmLabel: "Confirm", danger: false, onConfirm: () => {} });

  const ask = (title: string, message: string, onConfirm: () => void, danger = false, confirmLabel = "Confirm") =>
    setConfirmDialog({ open: true, title, message, onConfirm, danger, confirmLabel });
  const closeConfirm = () => setConfirmDialog((p) => ({ ...p, open: false }));

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("adminToken")
      : null;

  const fetchBookings = async () => {
    const res = await fetch("http://localhost:8080/api/admin/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setBookings(data);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = (bookingId: number, passengerName: string) => {
    ask(
      "Cancel Booking",
      `Cancel booking for ${passengerName}? This cannot be undone.`,
      async () => {
        await fetch(`http://localhost:8080/api/admin/bookings/${bookingId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchBookings();
      },
      true,
      "Cancel Booking"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Bookings</h1>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-lg">
                {booking.passengerName}
              </h3>

              <p className="text-sm text-gray-500">
                Phone Number: {booking.phoneNumber}
              </p>

              <p className="text-sm text-gray-500">
                Bus: {booking.busNumber}
              </p>

              <p className="text-sm text-gray-500">
                Route: {booking.route}
              </p>

              <p className="text-sm text-gray-500">
                Seat: {booking.seatNumber}
              </p>

              <p className="text-sm text-gray-500">
                Date: {booking.travelDate}
              </p>

              <p className="text-sm text-gray-500">
                Departure Time: {booking.departureTime}
              </p>

              <p className="text-sm text-gray-500">
                Arrival Time: {booking.arrivalTime}
              </p>

              <p className="text-sm font-semibold text-green-600">
                Booking ID: {booking.bookingCode}
              </p>
            </div>

            <button
              onClick={() => handleCancel(booking.id, booking.passengerName)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Cancel Booking
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        danger={confirmDialog.danger}
        onConfirm={() => { confirmDialog.onConfirm(); closeConfirm(); }}
        onCancel={closeConfirm}
      />
    </div>
  );
}