import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://backend:8000";

type Params = {
  params: {
    seatNumber: string;
  };
};

export async function POST(request: NextRequest, { params }: Params) {
  const reservedBy = request.nextUrl.searchParams.get("reserved_by");
  if (!reservedBy) {
    return NextResponse.json({ detail: "reserved_by is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${backendUrl}/reserve/${encodeURIComponent(params.seatNumber)}?reserved_by=${encodeURIComponent(reservedBy)}`,
      { method: "POST", cache: "no-store" }
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Failed to reserve seat" }, { status: 502 });
  }
}
