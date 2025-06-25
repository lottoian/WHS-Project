<h2> WhiteHat School 3rd </h2>

### 🔧 개발 환경 설정
```bash
# 의존성 설치
npm install
# 또는
pnpm install

# 개발 서버 실행 (로컬 테스트)
npm run dev
# 또는
pnpm run dev

# 개발 서버 실행 (외부 접속 허용)
npm run dev

### 🏗️ 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build
# 또는
pnpm run build

# 빌드된 파일을 웹서버로 복사
sudo cp -r dist/* /var/www/html/

### 🧹 정리 작업

```bash
# 빌드 캐시 삭제
rm -rf dist/
rm -rf node_modules/.vite/

# 의존성 재설치
rm -rf node_modules/
npm install
```

---

## ⚙️ 백엔드 (Backend)

### 📁 디렉토리 이동

```bash
cd /home/ubuntu/lucky_casino_backend
```

### 🔧 개발 환경 설정

```bash
# 가상환경 활성화
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 개발 서버 실행
python src/main.py

# 또는 Gunicorn 사용
gunicorn --workers 1 --bind 127.0.0.1:5001 src.main:app
```

## 데이터베이스 관리 (SQLite)

```bash
# SQLite 접속
sqlite3 src/database/app.db

# SQLite 명령어 예시
.tables                     # 테이블 목록
.schema user                # 테이블 구조 확인
SELECT * FROM user;         # 전체 데이터 확인
.quit                       # 종료
```
