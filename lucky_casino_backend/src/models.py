import sqlite3
from datetime import datetime
import os
from werkzeug.security import generate_password_hash

# 앱 전반에서 통일해서 쓸 DB 연결 함수
def get_db():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(BASE_DIR, 'database', 'app.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # 결과를 딕셔너리처럼 사용
    return conn

# 테이블 초기화 함수
def init_db():
    conn = get_db()
    c = conn.cursor()

    # 사용자 테이블
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            email TEXT,
            name TEXT,
            account_number TEXT,
            balance INTEGER DEFAULT 0,
            created_at TEXT,
            password_hash TEXT  
        )
    ''')

    # 입금 신청 테이블
    c.execute('''
        CREATE TABLE IF NOT EXISTS deposit_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount INTEGER,
            depositor_name TEXT,
            status TEXT,
            created_at TEXT
        )
    ''')

    # 출금 신청 테이블
    c.execute('''
        CREATE TABLE IF NOT EXISTS withdraw_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount INTEGER,
            account_number TEXT,
            bank_name TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()

# 예시 사용자 생성
def create_example_users():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(BASE_DIR, 'database', 'app.db')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    example_users = [
        (1, 'hong123', 'hong@example.com', '홍길동', '123-456-789', 100000, datetime.now().isoformat(), generate_password_hash('pass1')),
        (2, 'kim456', 'kim@example.com', '김민수', '222-333-444', 120000, datetime.now().isoformat(), generate_password_hash('pass2')),
        (3, 'lee789', 'lee@example.com', '이영희', '999-888-777', 75000, datetime.now().isoformat(), generate_password_hash('pass3')),
        (4, 'admin', 'admin@example.com', '관리자', '111-222-333', 0, datetime.now().isoformat(), generate_password_hash('admin123')),
    ]
    c.executemany('''
        INSERT OR IGNORE INTO users 
        (id, username, email, name, account_number, balance, created_at, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', example_users)

    conn.commit()
    conn.close()

# 실행용
if __name__ == '__main__':
    init_db()
    create_example_users()