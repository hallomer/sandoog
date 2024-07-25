#!/usr/bin/python3
"""Defines the User class."""
import datetime
from models.base_model import BaseModel, Base
from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash


class User(BaseModel, Base):
    """Represents a user."""
    __tablename__ = 'users'
    username = Column(String(80), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default='user')
    is_guest = Column(Boolean, default=False)
    last_activity = Column(DateTime, default=datetime.datetime.now(datetime.timezone.utc), onupdate=datetime.datetime.now(datetime.timezone.utc))


    from models.savings import Savings
    from models.budget import Budget
    from models.transaction import Transaction

    transactions = relationship('Transaction', back_populates='user',
                                cascade='all, delete, delete-orphan')
    budgets = relationship('Budget', back_populates='user',
                           cascade='all, delete, delete-orphan')
    savings = relationship('Savings', back_populates='user',
                           cascade='all, delete, delete-orphan')

    def __init__(self, *args, **kwargs):
        """Initializes a new User instance."""
        super().__init__(*args, **kwargs)
        if 'last_activity' in kwargs:
            self.last_activity = kwargs['last_activity'].replace(tzinfo=datetime.timezone.utc) if kwargs['last_activity'].tzinfo is None else kwargs['last_activity']
        else:
            self.last_activity = datetime.datetime.now(datetime.timezone.utc)

    def set_password(self, password):
        """Sets the user's password after hashing it."""
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """Checks the user's password."""
        return check_password_hash(self.password, password)

    def __repr__(self):
        """Returns a string representation of the user."""
        return f'<User {self.username}>'