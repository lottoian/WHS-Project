from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .board import BoardPost
from .betting import Game, Bet, Transaction
from .banner import Banner
