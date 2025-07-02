from flask import Blueprint, jsonify, request, session
from ..models import db, Banner, User
from . import login_required

bp = Blueprint('banner', __name__)

@bp.route('/api/banners', methods=['GET'])
def get_banners():
    banners = Banner.query.order_by(Banner.order).all()
    return jsonify([banner.to_dict() for banner in banners])

@bp.route('/api/banners/<int:banner_id>/click', methods=['POST'])
def increment_click(banner_id):
    banner = Banner.query.get_or_404(banner_id)
    banner.click_count += 1
    db.session.commit()
    return jsonify({'success': True, 'click_count': banner.click_count})

@bp.route('/api/banners/<int:banner_id>/view', methods=['POST'])
def increment_view(banner_id):
    banner = Banner.query.get_or_404(banner_id)
    banner.view_count += 1
    db.session.commit()
    return jsonify({'success': True, 'view_count': banner.view_count})

@bp.route('/api/banners', methods=['POST'])
@login_required
def create_banner():
    user = User.query.get(session['user_id'])
    if not user or user.username != 'admin':
        return jsonify({'error': '관리자만 배너를 추가할 수 있습니다.'}), 403
    data = request.json
    banner = Banner(
        image_url=data.get('image_url'),
        link_url=data.get('link_url'),
        alt_text=data.get('alt_text'),
        order=data.get('order', 0)
    )
    db.session.add(banner)
    db.session.commit()
    return jsonify(banner.to_dict()), 201 