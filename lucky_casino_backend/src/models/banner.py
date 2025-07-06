from . import db

class Banner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(255), nullable=False)
    link_url = db.Column(db.String(255), nullable=False)
    alt_text = db.Column(db.String(100), nullable=True)
    order = db.Column(db.Integer, nullable=False, default=0)
    click_count = db.Column(db.Integer, nullable=False, default=0)
    view_count = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "image_url": self.image_url,
            "link_url": self.link_url,
            "alt_text": self.alt_text,
            "order": self.order,
            "click_count": self.click_count,
            "view_count": self.view_count
        } 