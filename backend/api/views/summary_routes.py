#!/usr/bin/python3
"""Summary Management Routes."""
from flask import request, jsonify
from api.views import app_views
from models.engine.db_storage import DBStorage
from models.transaction import Transaction
from models.budget import Budget
from models.savings import Savings
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta


@app_views.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    """Get the summary for the current user."""
    current_user = get_jwt_identity()
    current_user_id = current_user if isinstance(current_user, str) else current_user.get('userId')

    storage = DBStorage()

    transactions = storage.all(Transaction).values()
    user_transactions = [t for t in transactions if t.user_id == current_user_id]

    total_income = sum(t.amount for t in user_transactions if t.type == 'income')
    total_expenses = sum(t.amount for t in user_transactions if t.type == 'expense')
    total_balance = total_income - total_expenses

    budgets = storage.all(Budget).values()
    user_budgets = [{"name": b.name, "amount": b.amount, "spent": b.spent} for b in budgets if b.user_id == current_user_id]

    savings = storage.all(Savings).values()
    user_savings = [{"name": s.name, "goal": s.goal, "saved": s.saved} for s in savings if s.user_id == current_user_id]

    income_transactions = [t for t in user_transactions if t.type == 'income']
    expense_transactions = [t for t in user_transactions if t.type == 'expense']

    return jsonify({
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_balance": total_balance,
        "budgets": user_budgets,
        "savings": user_savings,
        "incomeTransactions": [{"amount": t.amount, "date": t.date.isoformat(), "type": t.type} for t in income_transactions],
        "expenseTransactions": [{"amount": t.amount, "date": t.date.isoformat(), "type": t.type} for t in expense_transactions]
    }), 200
