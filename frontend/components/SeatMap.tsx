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

const statusClass = (status: string) => {
  if (status === "reserved") return "seat reserved";
  if (status === "blocked") return "seat blocked";
  return "seat free";
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
                className={statusClass(seat.status)}
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
