#!/usr/bin/python3
"""DBStorage module for the Sandoog project."""
import models
from models.user import User
from models.savings import Savings
from models.budget import Budget
from models.transaction import Transaction
from models.base_model import Base
from os import getenv
import sqlalchemy
from sqlalchemy import create_engine, event
from sqlalchemy.orm import scoped_session, sessionmaker

classes = {
    "User": User,
    "Transaction": Transaction,
    "Budget": Budget,
    "Savings": Savings
}

def confirm_deleted_rows(conn, cursor, statement, parameters, context, executemany):
    context._confirm_deleted_rows = False

class DBStorage:
    """Interacts with the MySQL database."""
    __engine = None
    __session = None
    __session_factory = None

    def __init__(self):
        """Initializes the DBStorage instance."""
        user = getenv('SAND00G_MYSQL_USER')
        pwd = getenv('SAND00G_MYSQL_PWD')
        host = getenv('SAND00G_MYSQL_HOST')
        db = getenv('SAND00G_MYSQL_DB')
        self.__engine = create_engine('mysql+mysqldb://{}:{}@{}/{}'.format(
            user, pwd, host, db))
        event.listen(self.__engine, 'before_cursor_execute', confirm_deleted_rows)
        Base.metadata.create_all(self.__engine)
        self.reload()

    def all(self, cls=None):
        """
        Query on the current database session all
        objects of a specific class.
        """
        all_objects = {}
        if cls:
            objs = self.__session.query(cls).all()
            for obj in objs:
                key = f'{obj.__class__.__name__}.{obj.id}'
                all_objects[key] = obj
        else:
            for class_name in classes.values():
                objs = self.__session.query(class_name).all()
                for obj in objs:
                    key = f'{obj.__class__.__name__}.{obj.id}'
                    all_objects[key] = obj
        return all_objects

    def new(self, obj):
        """Add the object to the current database session."""
        self.__session.add(obj)

    def save(self):
        """Commit all changes of the current database session."""
        self.__session.commit()

    def delete(self, obj=None):
        """Delete obj from the current database session if not None."""
        if obj:
            self.__session.delete(obj)

    def reload(self):
        """Reloads data from the database."""
        Base.metadata.create_all(self.__engine)
        self.__session_factory = sessionmaker(bind=self.__engine,
                                              expire_on_commit=False)
        self.__session = scoped_session(self.__session_factory)

    def close(self):
        """Call remove() method on the scoped session factory."""
        if self.__session:
            self.__session.remove()

    def get(self, cls, **kwargs):
        """Retrieve one object based on class and kwargs."""
        if cls not in classes.values():
            return None
        return self.__session.query(cls).filter_by(**kwargs).first()
