from functools import wraps
from flask import jsonify, session

# 로그인 여부 확인 데코레이터
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"message": "로그인이 필요합니다."}), 401
        return f(*args, **kwargs)
    return decorated_function

