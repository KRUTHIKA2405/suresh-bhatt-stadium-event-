"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import SeatMap from "../components/SeatMap";

type Seat = {
  id: number;
  gate: string;
  subgroup: string;
  seat_number: string;
  status: string;
  reserved_by: string | null;
};

export default function HomePage() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedName, setSelectedName] = useState("volunteer-laptop-1");
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    fetch("/api/seats")
      .then((res) => res.json())
      .then(setSeats)
      .catch(() => setStatus("Unable to load seat data"));

    const client = io({ path: "/socket.io", transports: ["websocket", "polling"] });

    client.on("connect", () => {
      setStatus("Connected to backend");
      client.emit("join_room", { room: "stadium" });
    });

    client.on("seat_update", (payload) => {
      setSeats((current) =>
        current.map((seat) =>
          seat.seat_number === payload.seat_number
            ? { ...seat, status: payload.status, reserved_by: payload.reserved_by }
            : seat
        )
      );
    });

    client.on("disconnect", () => {
      setStatus("Disconnected from backend");
    });

    return () => {
      client.disconnect();
    };
  }, []);

  const grouped = useMemo(() => {
    return seats.reduce<Record<string, Seat[]>>((groups, seat) => {
      const key = `${seat.gate}-${seat.subgroup}`;
      groups[key] = groups[key] || [];
      groups[key].push(seat);
      return groups;
    }, {});
  }, [seats]);

  const handleReserve = async (seatNumber: string) => {
    const response = await fetch(`/api/reserve/${seatNumber}?reserved_by=${encodeURIComponent(selectedName)}`, {
      method: "POST",
    });
    if (!response.ok) {
      const body = await response.json();
      setStatus(`Reservation failed: ${body.detail || response.statusText}`);
      return;
    }
    const updatedSeat = await response.json();
    setSeats((current) => current.map((seat) => (seat.id === updatedSeat.id ? updatedSeat : seat)));
    setStatus(`Reserved ${updatedSeat.seat_number}`);
  };

  return (
    <main className="page-shell">
      <header>
        <h1>Stadium Seat Booking</h1>
        <p>4 gates · 4 subgroups · first-come, first-served</p>
        <div className="status-row">
          <span className="status-chip">{status}</span>
          <label>
            Laptop name:
            <input value={selectedName} onChange={(event) => setSelectedName(event.target.value)} />
          </label>
        </div>
      </header>
      <SeatMap groups={grouped} onReserve={handleReserve} />
      <footer>
        <p>Live availability updates use Socket.IO. Backend: FastAPI + PostgreSQL.</p>
      </footer>
    </main>
  );
}
