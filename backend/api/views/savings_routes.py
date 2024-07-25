#!/usr/bin/python3
"""Savings Routes."""
from flask import request, jsonify
from api.views import app_views
from models.savings import Savings
from models.engine.db_storage import DBStorage
from models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

@app_views.route('/savings', methods=['POST'])
@jwt_required()
def create_saving():
    """Create a new savings entry."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    name = data.get('name')
    goal = data.get('goal')
    saved = data.get('saved', 0.0)

    if not name or goal is None:
        return jsonify({'error': 'Missing name or goal'}), 400

    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    user = storage.get(User, id=current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    new_saving = Savings(name=name, goal=float(goal), saved=float(saved), user_id=current_user_id)
    new_saving.contributions = []

    try:
        new_saving.validate()
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    storage.new(new_saving)
    storage.save()

    return jsonify(new_saving.to_dict()), 201


@app_views.route('/savings', methods=['GET'])
@jwt_required()
def get_user_savings():
    """Get all savings for the current user."""
    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    savings = storage.all(Savings).values()
    user_savings = [s.to_dict() for s in savings if s.user_id == current_user_id]

    return jsonify(user_savings), 200


@app_views.route('/savings/<savings_id>', methods=['GET'])
@jwt_required()
def get_saving(savings_id):
    """Retrieve a savings entry by its ID."""
    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    saving = storage.get(Savings, id=savings_id)
    if not saving:
        return jsonify({'error': 'Savings not found'}), 404

    if saving.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify(saving.to_dict()), 200


@app_views.route('/savings/<savings_id>', methods=['PUT'])
@jwt_required()
def update_saving(savings_id):
    """Update a savings entry."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    saving = storage.get(Savings, id=savings_id)
    if not saving:
        return jsonify({'error': 'Savings not found'}), 404

    if saving.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    name = data.get('name')
    goal = data.get('goal')
    saved = data.get('saved')

    if name:
        saving.name = name
    if goal is not None:
        try:
            saving.goal = float(goal)
            saving.validate()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
    if saved is not None:
        try:
            saving.saved = float(saved)
            saving.validate()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
    
    if 'contributions' in data:
        saving.contributions = data['contributions']

    storage.save()
    return jsonify(saving.to_dict()), 200


@app_views.route('/savings/<savings_id>', methods=['DELETE'])
@jwt_required()
def delete_saving(savings_id):
    """Delete a savings entry."""
    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    saving = storage.get(Savings, id=savings_id)
    if not saving:
        return jsonify({'error': 'Savings not found'}), 404

    if saving.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    storage.delete(saving)
    storage.save()
    return jsonify({'message': 'Savings deleted successfully'}), 200