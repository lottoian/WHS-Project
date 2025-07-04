from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
import os

app = Flask(__name__)
CORS(app)

# DB 연결
def get_db():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(BASE_DIR, 'database', 'app.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# 사용자 목록 조회 (검색 포함)
@app.route('/admin/users', methods=['GET'])
def get_users():
    username = request.args.get('username')
    if not is_admin(username):
        return jsonify({'status': 'fail', 'message': '권한 없음'}), 403
    keyword = request.args.get('keyword', '').strip()
    conn = get_db()
    c = conn.cursor()

    if keyword:
        like = f"%{keyword}%"
        c.execute('''
            SELECT id, username, email, name, account_number, balance, created_at
            FROM user
            WHERE username LIKE ? OR email LIKE ? OR name LIKE ?
            ORDER BY created_at DESC
        ''', (like, like, like))
    else:
        c.execute('''
            SELECT id, username, email, name, account_number, balance, created_at
            FROM user
            ORDER BY created_at DESC
        ''')

    rows = c.fetchall()
    conn.close()

    users = [
        {
            'id': row['id'],
            'username': row['username'],
            'email': row['email'],
            'name': row['name'],
            'account_number': row['account_number'],
            'balance': row['balance'],
            'created_at': row['created_at']
        }
        for row in rows
    ]
    return jsonify(users)

# 사용자 등록
@app.route('/admin/users', methods=['POST'])
def add_user():
    username = request.args.get('username')
    if not is_admin(username):
        return jsonify({'status': 'fail', 'message': '권한 없음'}), 403
    data = request.get_json()
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO user (username, email, name, account_number, balance, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['username'], data['email'], data['name'],
        data['account_number'], data['balance'], datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

# 사용자 수정
@app.route('/admin/users/<int:user_id>', methods=['PATCH'])
def update_user(user_id):
    username = request.args.get('username')
    if not is_admin(username):
        return jsonify({'status': 'fail', 'message': '권한 없음'}), 403
    data = request.get_json()
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        UPDATE user SET username=?, email=?, name=?, account_number=?, balance=?
        WHERE id=?
    ''', (
        data['username'], data['email'], data['name'],
        data['account_number'], data['balance'], user_id
    ))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

# 사용자 삭제
@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    username = request.args.get('username')
    if not is_admin(username):
        return jsonify({'status': 'fail', 'message': '권한 없음'}), 403
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM user WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok'})

# 관리자 통계
@app.route('/admin/stats')
def get_stats():
    username = request.args.get('username')
    if not is_admin(username):
        return jsonify({'status': 'fail', 'message': '권한 없음'}), 403
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM user")
    user_count = c.fetchone()[0]

    c.execute("SELECT SUM(balance) FROM user")
    total_balance = c.fetchone()[0] or 0

    c.execute("SELECT SUM(amount) FROM deposit_requests WHERE status = 'approved'")
    total_deposit = c.fetchone()[0] or 0

    c.execute("SELECT SUM(amount) FROM withdraw_requests WHERE status = 'approved'")
    total_withdraw = c.fetchone()[0] or 0

    conn.close()
    return jsonify({
        'user_count': user_count,
        'total_balance': total_balance,
        'total_deposit': total_deposit,
        'total_withdraw': total_withdraw
    })

# 입금 승인
@app.route('/charge/approve', methods=['POST'])
def approve_deposit():
    data = request.get_json()
    request_id = data['request_id']
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute("BEGIN")
        c.execute("SELECT user_id, amount, status FROM deposit_requests WHERE id=?", (request_id,))
        row = c.fetchone()
        if not row or row['status'] != 'pending':
            return jsonify({'status': 'fail', 'message': '유효하지 않은 요청'}), 400
        user_id, amount = row['user_id'], row['amount']
        c.execute("UPDATE user SET balance = balance + ? WHERE id = ?", (amount, user_id))
        c.execute("UPDATE deposit_requests SET status='approved' WHERE id = ?", (request_id,))
        conn.commit()
        return jsonify({'status': 'ok'})
    except Exception as e:
        conn.rollback()
        return jsonify({'status': 'fail', 'message': str(e)}), 500
    finally:
        conn.close()

# 출금 승인
@app.route('/withdraw/request', methods=['POST'])
def request_withdraw():
    data = request.get_json()
    user_id = data.get('user_id')
    amount = data.get('amount')
    account_number = data.get('account_number')
    bank_name = data.get('bank_name')

    if not all([user_id, amount, account_number, bank_name]):
        return jsonify({'status': 'fail', 'message': '필수 정보 누락'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO withdraw_requests (user_id, amount, account_number, bank_name, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', ?)
    ''', (user_id, amount, account_number, bank_name, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return jsonify({'status': 'ok'})


# 입금 요청 목록
@app.route('/admin/deposits')
def get_deposit_requests():
    username = request.args.get('username')
    if not is_admin(username):
        return jsonify({'status': 'fail', 'message': '권한 없음'}), 403
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM deposit_requests ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

# 출금 요청 목록
@app.route('/admin/withdrawals')
def get_withdraw_requests():
    username = request.args.get('username')
    if not is_admin(username):
        return jsonify({'status': 'fail', 'message': '권한 없음'}), 403
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM withdraw_requests ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

# 출금 승인
# 출금 승인
@app.route('/withdraw/approve', methods=['POST'])
def approve_withdraw():
    data = request.get_json()
    request_id = data.get('request_id')
    conn = get_db()
    c = conn.cursor()
    try:
        c.execute("BEGIN")
        c.execute("SELECT user_id, amount, status FROM withdraw_requests WHERE id = ?", (request_id,))
        row = c.fetchone()
        if not row or row['status'] != 'pending':
            return jsonify({'status': 'fail', 'message': '유효하지 않은 요청'}), 400
        user_id, amount = row['user_id'], row['amount']
        c.execute("SELECT balance FROM user WHERE id = ?", (user_id,))
        balance_row = c.fetchone()
        if not balance_row or balance_row['balance'] < amount:
            return jsonify({'status': 'fail', 'message': '잔액 부족'}), 400
        c.execute("UPDATE user SET balance = balance - ? WHERE id = ?", (amount, user_id))
        c.execute("UPDATE withdraw_requests SET status = 'approved' WHERE id = ?", (request_id,))
        conn.commit()
        return jsonify({'status': 'ok'})
    except Exception as e:
        conn.rollback()
        return jsonify({'status': 'fail', 'message': str(e)}), 500
    finally:
        conn.close()

# 입출금 전체 이력 조회
@app.route('/admin/history')
def get_history():
    username = request.args.get('username')
    if not is_admin(username):
        return jsonify({'status': 'fail', 'message': '권한 없음'}), 403
    conn = get_db()
    c = conn.cursor()

    # 입금 이력 (JOIN 포함)
    c.execute('''
        SELECT '입금' AS type, u.username, d.depositor_name AS name, d.amount, d.status, d.created_at
        FROM deposit_requests d
        JOIN user u ON d.user_id = u.id
    ''')
    deposits = c.fetchall()

    # 출금 이력 (JOIN 포함)
    c.execute('''
        SELECT '출금' AS type, u.username, w.account_number AS name, w.amount, w.status, w.created_at
        FROM withdraw_requests w
        JOIN user u ON w.user_id = u.id
    ''')
    withdrawals = c.fetchall()

    # 병합 및 정렬
    merged = [dict(row) for row in deposits + withdrawals]
    merged.sort(key=lambda x: x['created_at'], reverse=True)

    conn.close()
    return jsonify(merged)

# 사용자 로그인
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username'].strip()
    password = data['password'].strip()

    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM user WHERE username = ?", (username,))
    user = c.fetchone()
    conn.close()

    if user and check_password_hash(user['password_hash'], password):
        return jsonify({
            'status': 'ok',
            'user_id': user['id'],
            'name': user['name']
        })
    else:
        return jsonify({'status': 'fail', 'message': '로그인 실패'}), 401
    
# 입금 요청 등록
@app.route('/charge/request', methods=['POST'])
def request_deposit():
    data = request.get_json()
    user_id = data.get('user_id')
    depositor_name = data.get('depositor_name')
    amount = data.get('amount')

    if not all([user_id, depositor_name, amount]):
        return jsonify({'status': 'fail', 'message': '필수 항목 누락'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute('''
        INSERT INTO deposit_requests (user_id, depositor_name, amount, status, created_at)
        VALUES (?, ?, ?, 'pending', ?)
    ''', (user_id, depositor_name, amount, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return jsonify({'status': 'ok'})

# 로그아웃
@app.route('/logout', methods=['POST'])
def logout():
    # 실제 서비스에서는 세션/토큰 삭제 필요. 여기서는 단순 응답만 반환
    return jsonify({'status': 'ok'})

# 기본 루트
@app.route('/')
def index():
    return '입출금 시스템 백엔드 서버 정상 작동 중'

# 사용자 등록 (회원가입)
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    name = data.get('name')
    account_number = data.get('account_number')
    password = data.get('password')

    if not all([username, email, name, account_number, password]):
        return jsonify({'status': 'fail', 'message': '필수 항목 누락'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute('SELECT * FROM user WHERE username = ?', (username,))
    if c.fetchone():
        conn.close()
        return jsonify({'status': 'fail', 'message': '이미 존재하는 사용자 이름입니다.'}), 409
    c.execute('SELECT * FROM user WHERE email = ?', (email,))
    if c.fetchone():
        conn.close()
        return jsonify({'status': 'fail', 'message': '이미 사용 중인 이메일입니다.'}), 409

    password_hash = generate_password_hash(password)
    c.execute('''
        INSERT INTO user (username, email, name, account_number, balance, created_at, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (username, email, name, account_number, 10000, datetime.now().isoformat(), password_hash))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok', 'message': '회원가입 성공!'})

def is_admin(admin):
    return admin == 'admin'

if __name__ == '__main__':
    app.run(debug=True, port=5000)