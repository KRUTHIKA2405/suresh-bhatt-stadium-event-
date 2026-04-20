from sqlalchemy import Column, Integer, String

from .database import Base


class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, index=True)
    gate = Column(String(1), index=True)
    subgroup = Column(String(10), index=True)
    seat_number = Column(String(20), unique=True, index=True)
    status = Column(String(20), default="free", nullable=False)
    reserved_by = Column(String(100), nullable=True)
