#!/usr/bin/python3
""" Blueprint for API."""
from flask import Blueprint

app_views = Blueprint('app_views', __name__, url_prefix='/api/')

from api.views.budget_routes import *
from api.views.savings_routes import *
from api.views.summary_routes import *
from api.views.transaction_routes import *
from api.views.user_routes import *
