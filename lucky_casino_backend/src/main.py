import os
import sys
# DON'T CHANGE THE FOLLOWING TWO LINES
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), 'src'))
# DON'T CHANGE THE PRECEDING TWO LINES

from flask import Flask, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////home/ubuntu/lucky_casino_backend/src/database/app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "super-secret-key") # .env 파일에서 SECRET_KEY 로드

CORS(app, supports_credentials=True)
from models import db
db.init_app(app)

# Import models and routes
from models.user import User
from models.board import BoardPost
from models.betting import Game, Bet, Transaction
from models.banner import Banner

from routes.auth import auth_bp
from routes.board import board_bp
from routes.betting import betting_bp
from routes.profile import profile_bp
from routes.banner import bp as banner_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(board_bp, url_prefix='/api/board')
app.register_blueprint(betting_bp, url_prefix='/api/betting')
app.register_blueprint(profile_bp, url_prefix='/api/profile')
app.register_blueprint(banner_bp, url_prefix='/api')

@app.before_request
def make_session_permanent():
    session.permanent = True

with app.app_context():
    db.create_all()

    # 게임 데이터 초기화 (한 번만 실행)
    if not Game.query.first():
        coin_flip = Game(name='동전 던지기', description='앞면이 나오면 승리! 50% 확률로 2배 지급', min_bet=100, max_bet=5000)
        dice_roll = Game(name='주사위 게임', description='짝수가 나오면 승리! 50% 확률로 2배 지급', min_bet=200, max_bet=10000)
        lucky_slot = Game(name='럭키 슬롯', description='운이 좋으면 승리! 50% 확률로 2배 지급', min_bet=500, max_bet=20000)
        db.session.add_all([coin_flip, dice_roll, lucky_slot])
        db.session.commit()

    # 배너 데이터 초기화 (한 번만 실행)
    if not Banner.query.first():
        for i in range(1, 10):
            banner = Banner(
                image_url=f"/배너{i}.png",
                link_url="https://github.com/lottoian/WHS-Project/tree/main",
                alt_text=f"배너{i}",
                order=i
            )
            db.session.add(banner)
        db.session.commit()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)


