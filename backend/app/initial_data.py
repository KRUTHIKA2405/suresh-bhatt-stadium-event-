from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Seat


GATES = ["A", "B", "C", "D"]
SUBGROUPS = ["S1", "S2", "S3", "S4"]
SEATS_PER_SUBGROUP = 50


async def create_initial_seats(session: AsyncSession):
    result = await session.execute(select(func.count()).select_from(Seat))
    row = result.scalar_one()
    if row and row > 0:
        return

    for gate in GATES:
        for subgroup in SUBGROUPS:
            for number in range(1, SEATS_PER_SUBGROUP + 1):
                seat_number = f"{gate}-{subgroup}-{number:03d}"
                session.add(
                    Seat(
                        gate=gate,
                        subgroup=subgroup,
                        seat_number=seat_number,
                        status="free",
                    )
                )
    await session.commit()
