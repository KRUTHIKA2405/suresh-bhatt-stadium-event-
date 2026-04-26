"use client";

type Seat = {
  id: number;
  gate: string;
  subgroup: string;
  seat_number: string;
  status: string;
  reserved_by: string | null;
};

type Props = {
  groups: Record<string, Seat[]>;
  onReserve: (seatNumber: string) => void;
};

export function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 42%)`;
}

const seatClass = (status: string) => {
  if (status === "reserved") return "seat reserved";
  if (status === "blocked") return "seat blocked";
  return "seat free";
};

const seatStyle = (seat: Seat) => {
  if (seat.status === "reserved" && seat.reserved_by) {
    return { background: colorForName(seat.reserved_by), color: "#fff" };
  }
  return undefined;
};

export default function SeatMap({ groups, onReserve }: Props) {
  return (
    <section className="seat-map">
      {Object.entries(groups).map(([groupKey, seats]) => (
        <div className="group-card" key={groupKey}>
          <h2>{groupKey}</h2>
          <div className="seat-grid">
            {seats.map((seat) => (
              <button
                key={seat.id}
                className={seatClass(seat.status)}
                style={seatStyle(seat)}
                disabled={seat.status !== "free"}
                onClick={() => onReserve(seat.seat_number)}
              >
                {seat.seat_number}
                <span>{seat.status === "free" ? "Available" : seat.reserved_by || seat.status}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
