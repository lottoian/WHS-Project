from datetime import datetime
from . import db

class BoardPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    board_type = db.Column(db.String(50), nullable=False) # \"notice\" or \"free\"
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    username = db.Column(db.String(80), nullable=False) # 사용자 이름 저장
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('posts', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "board_type": self.board_type,
            "user_id": self.user_id,
            "username": self.username,
            "title": self.title,
            "content": self.content,
            "created_at": self.created_at.isoformat()
        }


