from flask import Blueprint, request, jsonify, session
from models import db, BoardPost, User
from . import login_required

board_bp = Blueprint("board", __name__)

@board_bp.route("/<string:board_type>", methods=["GET"])
def get_posts(board_type):
    if board_type not in ["notice", "free"]:
        return jsonify({"message": "유효하지 않은 게시판 타입입니다."}), 400

    posts = BoardPost.query.filter_by(board_type=board_type).order_by(BoardPost.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts])

@board_bp.route("<string:board_type>", methods=["POST"])
@login_required
def create_post(board_type):
    if board_type not in ["notice", "free"]:
        return jsonify({"message": "유효하지 않은 게시판 타입입니다."}), 400

    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    user_id = session["user_id"]
    user = User.query.get(user_id)

    if not title or not content:
        return jsonify({"message": "제목과 내용을 모두 입력해주세요."}), 400

    new_post = BoardPost(board_type=board_type, user_id=user_id, username=user.username, title=title, content=content)
    db.session.add(new_post)
    db.session.commit()

    return jsonify({"message": "게시글이 성공적으로 작성되었습니다."}), 201


