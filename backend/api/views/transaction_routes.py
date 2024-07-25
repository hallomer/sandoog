#!/usr/bin/python3
"""Transactions Routes."""
from flask import request, jsonify
from api.views import app_views
from models.engine.db_storage import DBStorage
from models.transaction import Transaction
from models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

@app_views.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    """Create a new transaction."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    amount = data.get('amount')
    description = data.get('description')
    type = data.get('type')
    date = data.get('date')

    if not amount or not description or not type or not date:
        return jsonify({'error': 'Missing required fields'}), 400

    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    user = storage.get(User, id=current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    new_transaction = Transaction(amount=amount, description=description,
                                  type=type, user_id=current_user_id, date=date)

    try:
        new_transaction.validate()
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    storage.new(new_transaction)
    storage.save()

    return jsonify(new_transaction.to_dict()), 201

@app_views.route('/transactions', methods=['GET'])
@jwt_required()
def get_user_transactions():
    """Get all transactions for the current user."""
    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()
    transactions = storage.all(Transaction).values()
    user_transactions = [t.to_dict() for t in transactions if t.user_id == current_user_id]

    return jsonify(user_transactions), 200

@app_views.route('/transactions/<transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    """Delete a specific transaction."""
    current_user = get_jwt_identity()
    current_user_id = current_user.get('userId')
    
    storage = DBStorage()
    transaction = storage.get(Transaction, id=transaction_id)
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    if transaction.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    storage.delete(transaction)
    storage.save()
    
    return jsonify({'message': 'Transaction deleted successfully'}), 200
