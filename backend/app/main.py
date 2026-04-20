import socketio
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from .database import engine, Base, AsyncSessionLocal, get_db
from .crud import get_all_seats, reserve_seat
from .initial_data import create_initial_seats
from .schemas import SeatRead

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=["*"])
app = FastAPI(title="Stadium Seat Booking API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)

sio_app = socketio.ASGIApp(sio, app)


@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await create_initial_seats(session)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/seats", response_model=list[SeatRead])
async def read_seats(db: AsyncSession = Depends(get_db)):
    return await get_all_seats(db)


@app.post("/reserve/{seat_number}", response_model=SeatRead)
async def book_seat(seat_number: str, reserved_by: str, db: AsyncSession = Depends(get_db)):
    try:
        seat = await reserve_seat(db, seat_number, reserved_by)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Seat reservation failed")
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not available")
    await sio.emit("seat_update", {
        "seat_number": seat.seat_number,
        "status": seat.status,
        "reserved_by": seat.reserved_by,
    })
    return seat


@sio.event
async def connect(sid, environ):
    print("Client connected", sid)


@sio.event
async def disconnect(sid):
    print("Client disconnected", sid)


@sio.event
async def join_room(sid, data):
    room = data.get("room", "stadium")
    sio.enter_room(sid, room)
    await sio.emit("status", {"message": f"Joined {room}"}, room=sid)
