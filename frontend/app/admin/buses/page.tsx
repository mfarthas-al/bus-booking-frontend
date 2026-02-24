"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function AdminBuses() {
  const [buses, setBuses] = useState<any[]>([]);
  const [busNumber, setBusNumber] = useState("");
  const [seatCapacity, setSeatCapacity] = useState(40);
  const [busType, setBusType] = useState("Normal");
  const [routeNumber, setRouteNumber] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; message: string;
    confirmLabel: string; danger: boolean; onConfirm: () => void;
  }>({ open: false, title: "", message: "", confirmLabel: "Confirm", danger: false, onConfirm: () => {} });

  const ask = (title: string, message: string, onConfirm: () => void, danger = false, confirmLabel = "Confirm") =>
    setConfirmDialog({ open: true, title, message, onConfirm, danger, confirmLabel });
  const closeConfirm = () => setConfirmDialog((p) => ({ ...p, open: false }));

  const token = typeof window !== "undefined"
    ? localStorage.getItem("adminToken")
    : null;

  const fetchBuses = async () => {
    const res = await fetch("http://localhost:8080/api/admin/buses", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    setBuses(data);
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleCreateBus = () => {
    ask(
      "Create Bus",
      `Create bus ${busNumber || ""} (${fromCity} → ${toCity})?`,
      async () => {
        await fetch("http://localhost:8080/api/admin/buses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ busNumber, seatCapacity, busType, routeNumber, fromCity, toCity }),
        });
        setBusNumber(""); setRouteNumber(""); setFromCity(""); setToCity("");
        fetchBuses();
      }
    );
  };

  const handleDelete = (id: number) => {
    ask(
      "Delete Bus",
      "This will permanently delete the bus and all its data. Continue?",
      async () => {
        await fetch(`http://localhost:8080/api/admin/buses/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchBuses();
      },
      true,
      "Delete"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Buses</h1>

      {/* Create Bus Form */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-4">Create Bus</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Bus Number"
            value={busNumber}
            onChange={(e) => setBusNumber(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            placeholder="Seat Capacity"
            value={seatCapacity}
            onChange={(e) => setSeatCapacity(Number(e.target.value))}
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="Bus Type"
            value={busType}
            onChange={(e) => setBusType(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="Route Number"
            value={routeNumber}
            onChange={(e) => setRouteNumber(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="From City"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="To City"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="border p-3 rounded-lg"
          />
        </div>

        <button
          onClick={handleCreateBus}
          className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Create Bus
        </button>
      </div>

      {/* Bus List */}
      <div className="space-y-4">
        {buses.map((bus) => (
          <div
            key={bus.id}
            className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-lg">{bus.busNumber}</h3>
              <p className="text-sm text-gray-500">
                {bus.fromCity} → {bus.toCity} (Route {bus.routeNumber})
              </p>
            </div>

            <button
              onClick={() => handleDelete(bus.id)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Delete
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