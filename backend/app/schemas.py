from typing import Optional

from pydantic import BaseModel


class SeatBase(BaseModel):
    gate: str
    subgroup: str
    seat_number: str


class SeatCreate(SeatBase):
    pass


class SeatUpdate(BaseModel):
    status: Optional[str] = None
    reserved_by: Optional[str] = None


class SeatRead(SeatBase):
    id: int
    status: str
    reserved_by: Optional[str] = None

    class Config:
        from_attributes = True
