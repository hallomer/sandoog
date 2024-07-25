#!/usr/bin/python3
"""BaseModel module for the Sandoog project."""
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
import uuid

Base = declarative_base()


class BaseModel:
    """A base class for all models in the Sandoog project."""
    id = Column(String(60), primary_key=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        nullable=False)

    def __init__(self, *args, **kwargs):
        """Initializes a new model."""
        self.id = str(uuid.uuid4())
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
        for key, value in kwargs.items():
            setattr(self, key, value)

    def save(self):
        """Updates updated_at and saves the model to the database."""
        from models.engine.db_storage import DBStorage
        self.updated_at = datetime.now(timezone.utc)
        storage = DBStorage()
        storage.new(self)
        storage.save()

    def to_dict(self):
        """Converts the model instance to a dictionary format."""
        my_dict = self.__dict__.copy()
        my_dict['__class__'] = self.__class__.__name__
        my_dict['created_at'] = self.created_at.isoformat()
        my_dict['updated_at'] = self.updated_at.isoformat()
        if '_sa_instance_state' in my_dict:
            del my_dict['_sa_instance_state']
        return my_dict

    def delete(self):
        """Deletes the current instance from the storage."""
        from models.engine.db_storage import DBStorage
        storage = DBStorage()
        storage.delete(self)

    def __str__(self):
        """Returns a string representation of the model instance."""
        return f'[{self.__class__.__name__}] ({self.id}) {self.__dict__}'
