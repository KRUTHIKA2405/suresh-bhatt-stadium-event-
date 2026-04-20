from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Seat
from .schemas import SeatUpdate


async def get_all_seats(session: AsyncSession):
    result = await session.execute(select(Seat).order_by(Seat.gate, Seat.subgroup, Seat.seat_number))
    return result.scalars().all()


async def get_seat_by_number(session: AsyncSession, seat_number: str):
    result = await session.execute(select(Seat).where(Seat.seat_number == seat_number))
    return result.scalar_one_or_none()


async def reserve_seat(session: AsyncSession, seat_number: str, reserved_by: str):
    seat = await get_seat_by_number(session, seat_number)
    if not seat or seat.status != "free":
        return None

    stmt = (
        update(Seat)
        .where(Seat.seat_number == seat_number, Seat.status == "free")
        .values(status="reserved", reserved_by=reserved_by)
    )
    await session.execute(stmt)
    await session.commit()
    return await get_seat_by_number(session, seat_number)


async def create_or_update_seat(session: AsyncSession, seat: SeatUpdate):
    existing = await get_seat_by_number(session, seat.seat_number)
    if existing:
        for key, value in seat.dict(exclude_none=True).items():
            setattr(existing, key, value)
        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing
    return None
