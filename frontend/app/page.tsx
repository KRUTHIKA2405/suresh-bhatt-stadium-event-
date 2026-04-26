"use client";

import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import SeatMap, { colorForName } from "../components/SeatMap";

type Seat = {
  id: number;
  gate: string;
  subgroup: string;
  seat_number: string;
  status: string;
  reserved_by: string | null;
};

function getBackendUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (typeof window === "undefined") return "";
  return `${window.location.protocol}//${window.location.hostname}:8000`;
}

export default function HomePage() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedName, setSelectedName] = useState("volunteer-laptop-1");
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    const backendUrl = getBackendUrl();

    fetch(`${backendUrl}/seats`, { cache: "no-store" })
      .then((res) => res.json())
      .then(setSeats)
      .catch(() => setStatus("Unable to load seat data"));

    const client: Socket = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    client.on("connect", () => {
      setStatus(`Connected to ${backendUrl}`);
      client.emit("join_room", { room: "stadium" });
    });

    client.on("seat_update", (payload: { seat_number: string; status: string; reserved_by: string | null }) => {
      setSeats((current) =>
        current.map((seat) =>
          seat.seat_number === payload.seat_number
            ? { ...seat, status: payload.status, reserved_by: payload.reserved_by }
            : seat
        )
      );
    });

    client.on("connect_error", (err) => {
      setStatus(`Connect error: ${err.message}`);
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

  const bookers = useMemo(() => {
    const set = new Set<string>();
    seats.forEach((s) => {
      if (s.status === "reserved" && s.reserved_by) set.add(s.reserved_by);
    });
    return [...set].sort();
  }, [seats]);

  const handleReserve = async (seatNumber: string) => {
    const backendUrl = getBackendUrl();
    const response = await fetch(
      `${backendUrl}/reserve/${encodeURIComponent(seatNumber)}?reserved_by=${encodeURIComponent(selectedName)}`,
      { method: "POST", cache: "no-store" }
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
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
        <div className="legend">
          <span className="legend-item">
            <span className="legend-swatch legend-swatch-free" />
            Available
          </span>
          {bookers.map((name) => (
            <span key={name} className="legend-item">
              <span className="legend-swatch" style={{ background: colorForName(name) }} />
              {name}
            </span>
          ))}
        </div>
      </header>
      <SeatMap groups={grouped} onReserve={handleReserve} />
      <footer>
        <p>Live availability updates use Socket.IO. Backend: FastAPI + PostgreSQL.</p>
      </footer>
    </main>
  );
}
