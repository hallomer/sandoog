#!/usr/bin/python3
"""Budget Routes."""
from flask import request, jsonify
from api.views import app_views
from models.engine.db_storage import DBStorage
from models.budget import Budget
from models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

@app_views.route('/budgets', methods=['POST'])
@jwt_required()
def create_budget():
    """Create a new budget."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    name = data.get('name')
    amount = data.get('amount')
    spent = data.get('spent', 0.0)

    if not name or amount is None:
        return jsonify({'error': 'Missing name or amount'}), 400

    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    user = storage.get(User, id=current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    new_budget = Budget(name=name, amount=float(amount), spent=float(spent), user_id=current_user_id)
    new_budget.expenses = []

    try:
        new_budget.validate()
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    storage.new(new_budget)
    storage.save()

    return jsonify(new_budget.to_dict()), 201


@app_views.route('/budgets', methods=['GET'])
@jwt_required()
def get_user_budgets():
    """Get all budgets for the current user."""
    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    budgets = storage.all(Budget).values()
    user_budgets = [b.to_dict() for b in budgets if b.user_id == current_user_id]

    return jsonify(user_budgets), 200


@app_views.route('/budgets/<budget_id>', methods=['GET'])
@jwt_required()
def get_budget(budget_id):
    """Retrieve a budget by its ID."""
    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    budget = storage.get(Budget, id=budget_id)
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404

    if budget.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    return jsonify(budget.to_dict()), 200


@app_views.route('/budgets/<budget_id>', methods=['PUT'])
@jwt_required()
def update_budget(budget_id):
    """Update a budget."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    budget = storage.get(Budget, id=budget_id)
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404

    if budget.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    name = data.get('name')
    amount = data.get('amount')
    spent = data.get('spent')

    if name:
        budget.name = name
    if amount is not None:
        try:
            budget.amount = float(amount)
            budget.validate()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
    if spent is not None:
        try:
            budget.spent = float(spent)
            budget.validate()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
    if 'expenses' in data:
        budget.expenses = data['expenses']

    storage.save()
    return jsonify(budget.to_dict()), 200


@app_views.route('/budgets/<budget_id>', methods=['DELETE'])
@jwt_required()
def delete_budget(budget_id):
    """Delete a budget."""
    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    budget = storage.get(Budget, id=budget_id)
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404

    if budget.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    storage.delete(budget)
    storage.save()
    return jsonify({'message': 'Budget deleted successfully'}), 200