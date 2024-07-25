#!/usr/bin/python3
"""Defines the Transaction class."""
from models.base_model import BaseModel, Base
from sqlalchemy import Column, Float, String, DateTime, ForeignKey, Index
from sqlalchemy.types import Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone


class Transaction(BaseModel, Base):
    """Represents a financial transaction (income or expense)."""
    __tablename__ = 'transactions'
    amount = Column(Float, nullable=False)
    description = Column(String(128), nullable=False)
    type = Column(Enum('income', 'expense',
                       name='transaction_type'), nullable=False)
    user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
    user = relationship('User', back_populates='transactions')
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                  nullable=False)

    __table_args__ = (
        Index('ix_user_id', 'user_id'),
    )

    def validate(self):
        """Validates the transaction details."""
        if self.amount < 0:
            raise ValueError("Amount must be non-negative")

    def __repr__(self):
        """Returns a string representation of the transaction."""
        return f'<Transaction {self.type} {self.description}: ${self.amount}>'
