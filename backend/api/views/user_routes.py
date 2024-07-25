#!/usr/bin/python3
"""User Authentication Routes."""
from flask import request, jsonify
from api.views import app_views
from models.engine.db_storage import DBStorage
from models.user import User
from models.budget import Budget
from models.savings import Savings
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
import uuid
import datetime

DEFAULT_BUDGETS = [
    {'name': 'Home stuff', 'amount': 500.0},
    {'name': 'Transportation', 'amount': 400.0},
    {'name': 'Entertainment', 'amount': 200.0},
]

DEFAULT_SAVINGS = [
    {'name': 'Emergency', 'goal': 2000.0},
    {'name': 'Investments', 'goal': 3000.0},
    {'name': 'Travel', 'goal': 1000.0},
]


@app_views.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    storage = DBStorage()
    if storage.get(User, username=username):
        return jsonify({'error': 'User already exists'}), 400

    new_user = User(username=username)
    new_user.set_password(password)
    storage.new(new_user)
    storage.save()

    for budget_data in DEFAULT_BUDGETS:
        new_budget = Budget(**budget_data, user_id=new_user.id)
        storage.new(new_budget)

    for savings_data in DEFAULT_SAVINGS:
        new_savings = Savings(**savings_data, user_id=new_user.id)
        storage.new(new_savings)

    storage.save()

    access_token = create_access_token(identity={'userId': new_user.id, 'username': new_user.username})
    refresh_token = create_refresh_token(identity={'userId': new_user.id, 'username': new_user.username})
    return jsonify(user=new_user.to_dict(), access_token=access_token, refresh_token=refresh_token), 201


@app_views.route('/login', methods=['POST'])
def login():
    """Login an existing user."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    storage = DBStorage()
    user = storage.get(User, username=username)
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password'}), 400

    access_token = create_access_token(identity={'userId': user.id, 'username': user.username})
    refresh_token = create_refresh_token(identity={'userId': user.id, 'username': user.username})
    return jsonify(user=user.to_dict(), access_token=access_token, refresh_token=refresh_token), 200


@app_views.route('/guest_session', methods=['POST'])
def guest_session():
    """Create a guest session."""
    guest_username = f'guest_{uuid.uuid4()}'
    guest_password = 'guest_password'
    guest_user = User(username=guest_username, password=guest_password, is_guest=True)
    guest_user.set_password(guest_password)
    guest_user.last_activity = datetime.datetime.now(datetime.timezone.utc)
    storage = DBStorage()
    storage.new(guest_user)
    storage.save()

    for budget_data in DEFAULT_BUDGETS:
        new_budget = Budget(**budget_data, user_id=guest_user.id)
        storage.new(new_budget)

    for savings_data in DEFAULT_SAVINGS:
        new_savings = Savings(**savings_data, user_id=guest_user.id)
        storage.new(new_savings)

    storage.save()

    access_token = create_access_token(identity={'userId': guest_user.id, 'username': guest_user.username})
    return jsonify(user=guest_user.to_dict(), access_token=access_token), 201


@app_views.route('/users/<user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete a user by id."""
    current_user = get_jwt_identity()
    if current_user['userId'] != user_id:
        return jsonify({'error': 'Unauthorized action'}), 403

    storage = DBStorage()
    user = storage.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    for budget in user.budgets:
        storage.delete(budget)

    storage.delete(user)
    storage.save()
    return jsonify({}), 204


@app_views.route('/check_user', methods=['POST'])
def check_user():
    """Check if a user exists."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    username = data.get('username')
    if not username:
        return jsonify({'error': 'Missing username'}), 400

    storage = DBStorage()
    user = storage.get(User, username=username)
    return jsonify({'exists': bool(user)}), 200


@app_views.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh the access token using the refresh token."""
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    is_guest = current_user.get('is_guest', False)
    return jsonify(access_token=access_token, is_guest=is_guest), 200
