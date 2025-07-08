from flask import Blueprint, request, jsonify
from ..database import db_session
from ..models.charge import Charge
from ..models.user import User

bp = Blueprint('charge', __name__, url_prefix='/api/charge')

@bp.route('/request', methods=['POST'])
def charge_request():
    data = request.get_json()
    username = data.get('username')
    amount = data.get('amount')
    if not username or not amount:
        return jsonify({'status': 'error', 'message': '필수 정보 누락'}), 400
    charge = Charge(username=username, amount=amount)
    db_session.add(charge)
    db_session.commit()
    return jsonify({'status': 'ok'})

@bp.route('/list', methods=['GET'])
def charge_list():
    charges = db_session.query(Charge).order_by(Charge.created_at.desc()).all()
    return jsonify([
        {
            'id': c.id,
            'username': c.username,
            'amount': c.amount,
            'status': c.status
        } for c in charges
    ])

@bp.route('/user-list', methods=['POST'])
def charge_user_list():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({'status': 'error', 'message': '필수 정보 누락'}), 400
    charges = db_session.query(Charge).filter_by(username=username).order_by(Charge.created_at.desc()).all()
    return jsonify([
        {
            'id': c.id,
            'amount': c.amount,
            'status': c.status,
            'created_at': c.created_at.strftime('%Y-%m-%d %H:%M')
        } for c in charges
    ])

@bp.route('/approve', methods=['POST'])
def charge_approve():
    data = request.get_json()
    charge_id = data.get('id')
    charge = db_session.query(Charge).filter_by(id=charge_id).first()
    if not charge or charge.status == '승인 완료':
        return jsonify({'status': 'error', 'message': '잘못된 요청'}), 400
    user = db_session.query(User).filter_by(username=charge.username).first()
    if not user:
        return jsonify({'status': 'error', 'message': '사용자 없음'}), 400
    user.game_money += charge.amount
    charge.status = '승인 완료'
    db_session.commit()
    return jsonify({'status': 'ok'}) 