#!/usr/bin/python3
"""Flask app."""
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.views import app_views
from dotenv import load_dotenv
from os import getenv
from datetime import timedelta, datetime
import datetime as dt
from apscheduler.schedulers.background import BackgroundScheduler
from models.user import User

load_dotenv()

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config['JWT_SECRET_KEY'] = getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)
app.register_blueprint(app_views)

scheduler = BackgroundScheduler()

def clean_guest_sessions():
    """Cleans guest sessions."""
    from models.engine.db_storage import DBStorage
    storage = DBStorage()
    guest_users = [user for user in storage.all(User).values() if user.is_guest]
    now = datetime.now(dt.timezone.utc)
    for user in guest_users:
        if user.last_activity.tzinfo is None:
            user.last_activity = user.last_activity.replace(tzinfo=dt.timezone.utc)
        if user.last_activity < now - timedelta(minutes=15):
            for budget in user.budgets:
                storage.delete(budget)
            for savings in user.savings:
                storage.delete(savings)
            for transaction in user.transactions:
                storage.delete(transaction)
            storage.delete(user)
    storage.save()

scheduler.add_job(func=clean_guest_sessions, trigger='interval', id='clean_guest_sessions', minutes=15)
scheduler.start()


@app.teardown_appcontext
def close_db(error):
    """Close Storage."""
    from models.engine.db_storage import DBStorage
    storage = DBStorage()
    storage.close()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port='5000', threaded=True)