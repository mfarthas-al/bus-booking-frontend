"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [passengerName, setPassengerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/routes")
      .then((res) => res.json())
      .then((data) => setRoutes(data));
  }, []);

  const fetchSchedules = () => {
    if (!selectedDate) return;

    fetch(`http://localhost:8080/api/schedules/by-date?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => setSchedules(data));
  };

  const fetchSeats = (scheduleId: number) => {
    fetch(`http://localhost:8080/api/seats?scheduleId=${scheduleId}`)
      .then((res) => res.json())
      .then((data) => setSeats(data));
  };

  const handleBooking = () => {
    fetch(
      `http://localhost:8080/api/bookings?seatId=${selectedSeat}&passengerName=${passengerName}&phoneNumber=${phoneNumber}`,
      {
        method: "POST",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setBookingResult(data);
        fetchSeats(selectedSchedule.id); // refresh seats
      });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bus Booking</h1>

      {/* Date Picker */}
      <div className="mb-4">
        <input
          type="date"
          className="border p-2"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button
          onClick={fetchSchedules}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Schedules */}
      <div>
        {schedules.map((schedule) => (
          <div key={schedule.id} className="p-4 border rounded mb-2">
            <p>
              {schedule.bus.route.fromCity} → {schedule.bus.route.toCity}
            </p>
            <p>Bus: {schedule.bus.busNumber}</p>
            <p>
              {schedule.departureTime} - {schedule.arrivalTime}
            </p>
            <button
              onClick={() => {
                setSelectedSchedule(schedule);
                fetchSeats(schedule.id);
              }}
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
            >
              Select Seats
            </button>
          </div>
        ))}
        {selectedSchedule && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Select Seat</h2>

            <div className="grid grid-cols-4 gap-4 max-w-md">
              {seats.map((seat) => (
                <div
                  key={seat.id}
                  onClick={() => !seat.isBooked && setSelectedSeat(seat.id)}
                  className={`
            p-4 text-center rounded cursor-pointer
            ${
              seat.isBooked
                ? "bg-red-400 cursor-not-allowed"
                : selectedSeat === seat.id
                  ? "bg-blue-500 text-white"
                  : "bg-green-400"
            }
          `}
                >
                  {seat.seatNumber}
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedSeat && (
          <div className="mt-6 max-w-md">
            <h3 className="text-lg font-bold mb-2">Passenger Details</h3>

            <input
              type="text"
              placeholder="Passenger Name"
              className="border p-2 w-full mb-2"
              onChange={(e) => setPassengerName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="border p-2 w-full mb-2"
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <button
              onClick={handleBooking}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Confirm Booking
            </button>
          </div>
        )}
        {bookingResult && (
          <div className="mt-6 p-4 bg-green-100 rounded">
            <h3 className="font-bold">Booking Confirmed 🎉</h3>
            <p>Booking ID: {bookingResult.data.bookingCode}</p>
            <p>Bus: {bookingResult.data.busNumber}</p>
            <p>Route: {bookingResult.data.route}</p>
            <p>Seat: {bookingResult.data.seatNumber}</p>
            <p>Departure: {bookingResult.data.departureTime}</p>
            <p>Arrival: {bookingResult.data.arrivalTime}</p>
          </div>
        )}
      </div>
    </div>
  );
}
