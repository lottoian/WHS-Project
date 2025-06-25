from flask import Blueprint, request, jsonify, session
from models import db, User

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"message": "모든 필드를 입력해주세요."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "이미 존재하는 사용자 이름입니다."}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "이미 사용 중인 이메일입니다."}), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "회원가입 성공!"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        session["user_id"] = user.id
        return jsonify({"message": "로그인 성공!", "user": user.to_dict()})
    else:
        return jsonify({"message": "사용자 이름 또는 비밀번호가 잘못되었습니다."}), 401

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "로그아웃 성공!"})

@auth_bp.route("/check-session", methods=["GET"])
def check_session():
    if "user_id" in session:
        user = User.query.get(session["user_id"])
        if user:
            return jsonify({"user": user.to_dict()})
    return jsonify({"user": None})


