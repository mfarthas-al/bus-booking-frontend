"use client";

import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div
          onClick={() => router.push("/admin/buses")}
          className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Buses</h2>
          <p className="text-gray-500 text-sm">
            Create, update, and delete buses.
          </p>
        </div>

        <div
          onClick={() => router.push("/admin/schedules")}
          className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Schedules</h2>
          <p className="text-gray-500 text-sm">
            Create and manage bus schedules.
          </p>
        </div>

        <div
          onClick={() => router.push("/admin/bookings")}
          className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Bookings</h2>
          <p className="text-gray-500 text-sm">
            View and cancel bookings.
          </p>
        </div>
      </div>
    </div>
  );
}
