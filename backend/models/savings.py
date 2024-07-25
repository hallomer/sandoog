#!/usr/bin/python3
"""Defines the Savings class."""
from models.base_model import BaseModel, Base
from sqlalchemy import Column, String, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy import JSON


class Savings(BaseModel, Base):
    """Represents a savings target and current savings amount for a user."""
    __tablename__ = 'savings'
    name = Column(String(128), nullable=False)
    goal = Column(Float, nullable=False)
    saved = Column(Float, default=0.0, nullable=False)
    contributions = Column(MutableList.as_mutable(JSON), default=[])
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    user = relationship('User', back_populates='savings')

    __table_args__ = (
        Index('ix_user_id', 'user_id'),
    )

    def validate(self):
        """Validates the savings details."""
        if self.goal < 0:
            raise ValueError("Goal must be non-negative")
        if self.saved < 0:
            raise ValueError("Saved amount must be non-negative")

    def __repr__(self):
        """Returns a string representation of the saving."""
        return f'<Savings {self.name}: ${self.goal}, Spent: ${self.saved}>'
