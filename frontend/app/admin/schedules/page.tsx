"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function AdminSchedules() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");

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

  const fetchSchedules = async () => {
    const res = await fetch("http://localhost:8080/api/admin/schedules", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSchedules(data);
  };

  const fetchBuses = async () => {
    const res = await fetch("http://localhost:8080/api/admin/buses", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBuses(data);
  };

  useEffect(() => {
    fetchSchedules();
    fetchBuses();
  }, []);

  const handleCreateSchedule = async () => {
    ask(
      "Create Schedule",
      "Are you sure you want to create this schedule?",
      async () => {
        await fetch(
          `http://localhost:8080/api/admin/schedules?busId=${selectedBusId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ travelDate, departureTime, arrivalTime }),
          }
        );
        fetchSchedules();
      }
    );
  };

  const handleDelete = (id: number) => {
    ask(
      "Delete Schedule",
      "This will permanently delete the schedule. Continue?",
      async () => {
        await fetch(`http://localhost:8080/api/admin/schedules/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchSchedules();
      },
      true,
      "Delete"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Schedules</h1>

      {/* Create Schedule */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Create Schedule</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option value="">Select Bus</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.busNumber} ({bus.fromCity} → {bus.toCity})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            type="time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className="border p-3 rounded-lg"
          />
        </div>

        <button
          onClick={handleCreateSchedule}
          className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Create Schedule
        </button>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">
                {schedule.bus.busNumber}
              </h3>
              <p className="text-sm text-gray-500">
                {schedule.bus.fromCity} → {schedule.bus.toCity}
              </p>
              <p className="text-sm">
                {schedule.travelDate} | {schedule.departureTime} → {schedule.arrivalTime}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/seats/${schedule.id}`)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Manage Seats
              </button>
              <button
                onClick={() => handleDelete(schedule.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
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