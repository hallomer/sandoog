#!/usr/bin/python3
"""Defines the Budget class."""
from models.base_model import BaseModel, Base
from sqlalchemy import Column, String, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy import JSON


class Budget(BaseModel, Base):
    """Represents a budget or a user."""
    __tablename__ = 'budgets'
    name = Column(String(128), nullable=False)
    amount = Column(Float, nullable=False)
    spent = Column(Float, default=0.0, nullable=False)
    expenses = Column(MutableList.as_mutable(JSON), default=[])
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    user = relationship('User', back_populates='budgets')

    __table_args__ = (
        Index('ix_user_id', 'user_id'),
    )

    def validate(self):
        """Validates the budget details."""
        if self.amount < 0:
            raise ValueError("Amount must be non-negative")
        if self.spent < 0:
            raise ValueError("Spent amount must be non-negative")

    def __repr__(self):
        """Returns a string representation of the budget."""
        return f'<Budget {self.name}: ${self.amount}, Spent: ${self.spent}>'