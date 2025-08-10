#!/usr/bin/env bash
#
# WHS.sh (with copy failure logging)
set -euo pipefail
IFS=$'\n\t'

# Usage

usage() {
  cat <<EOF
Usage: sudo $0 [OUTPUT_TAR]
  OUTPUT_TAR: 생성할 tar.gz 파일 경로
             (기본: ./forensic_YYYYMMDD_HHMMSS.tar.gz)
EOF
  exit 1
}

ensure_root() {
  [[ $EUID -eq 0 ]] || {
    echo "ERROR: 루트 권한으로 실행해야 합니다." >&2
    exit 1
  }
}

# copy_fail

log_copy_fail() {
  local fail_path="$1"
  echo "$fail_path" >> "$COPY_FAIL_LOG"
}

# 1) OS INFO

collect_os_info() {
  echo "[*] OS 정보 수집..."
  if ! lsb_release -a &> "${WORK_DIR}/os_info.log"; then
    log_copy_fail "lsb_release"
  fi
}

# 2) Dir Dump

collect_dirs() {
  echo "[*] /var/log 아카이브 생성..."
  mkdir -p "${WORK_DIR}/var"
  if ! tar czf "${WORK_DIR}/var/log.tar.gz" --directory=/var log --one-file-system; then
    echo "경고: /var/log 아카이브 생성 실패"
    log_copy_fail "/var/log"
  fi

  for src in /home /root; do
    echo "[*] ${src} 복사 (rsync)..."
    dest="${WORK_DIR}${src}"
    mkdir -p "$dest"
    if ! rsync -a --info=progress2 "${src}/" "$dest/"; then
      echo "경고: ${src} rsync 실패"
      log_copy_fail "$src"
    fi
  done
}

# 3) Web Engine Detection & Version & Package Collect

detect_web_servers() {
  echo "[*] 웹엔진 탐지 및 버전·패키지 정보 수집..."
  WEB_INFO="${WORK_DIR}/webserver_info.log"
  WEB_PKGS="${WORK_DIR}/webserver_pkgs.log"
  >"$WEB_INFO"
  >"$WEB_PKGS"

  detected_web=()
  for cmd in nginx apache2 httpd lighttpd; do
    if command -v "$cmd" &>/dev/null; then
      echo "Detected: $cmd" >>"$WEB_INFO"
      case "$cmd" in
        nginx)    nginx -v   &>>"$WEB_INFO" ;;
        apache2)  apache2 -v &>>"$WEB_INFO" ;;
        httpd)    httpd -v   &>>"$WEB_INFO" ;;
        lighttpd) lighttpd -v&>>"$WEB_INFO" ;;
      esac
      detected_web+=("$cmd")
    fi
  done

  if command -v dpkg &>/dev/null; then
    dpkg -l | grep -iE "(nginx|apache2|httpd|lighttpd)" >>"$WEB_PKGS" || true
  elif command -v rpm &>/dev/null; then
    rpm -qa | grep -iE "(nginx|apache|httpd|lighttpd)" >>"$WEB_PKGS" || true
  else
    echo "No supported package manager" >>"$WEB_PKGS"
  fi
}

# 4) Web Engine Config File Dump

collect_web_configs() {
  echo "[*] 웹엔진 설정 파일 복사..."
  for srv in "${detected_web[@]:-}"; do
    case "$srv" in
      nginx)    src="/etc/nginx" ;;
      apache2|httpd) src="/etc/apache2" ;;
      lighttpd) src="/etc/lighttpd" ;;
      *)        continue ;;
    esac
    echo "  - $src → WORK_DIR$src"
    dest="${WORK_DIR}${src}"
    mkdir -p "$dest"
    if ! cp -a "${src}/." "$dest/"; then
      echo "경고: $src 복사 실패"
      log_copy_fail "$src"
    fi
  done
}

# 5) Link Site Artifcat Dump

collect_site_artifacts() {
  echo "[*] 사이트 아티팩트 수집..."
  for srv in "${detected_web[@]:-}"; do
    case "$srv" in
      nginx)
        confs=(/etc/nginx/sites-available/*)
        root_pattern='^\s*root\s+'
        ;;
      apache2|httpd)
        confs=(/etc/apache2/sites-available/*)
        root_pattern='^\s*DocumentRoot\s+'
        ;;
      *) continue ;;
    esac

    for conf in "${confs[@]}"; do
      [[ -f "$conf" ]] || continue
      paths=$(grep -Ei "$root_pattern" "$conf" | awk '{print $2}' | sed 's/[;""]//g')
      for webroot in $paths; do
        [[ -d "$webroot" ]] || continue
        echo "  - $webroot → WORK_DIR$webroot"
        dest="${WORK_DIR}${webroot}"
        mkdir -p "$dest"
        if ! cp -a "${webroot}/." "$dest/"; then
          echo "경고: $webroot 복사 실패"
          log_copy_fail "$webroot"
        fi
      done
    done
  done
}

# 6) DB Engine Detect & Version & Package Collect

detect_db_engines() {
  echo "[*] DB엔진 탐지 및 버전·패키지 정보 수집..."
  DB_INFO="${WORK_DIR}/db_info.log"
  DB_PKGS="${WORK_DIR}/db_pkgs.log"
  >"$DB_INFO"
  >"$DB_PKGS"

  detected_db=()
  for cmd in mysql psql mongod sqlite3; do
    if command -v "$cmd" &>/dev/null; then
      echo "Detected: $cmd" >>"$DB_INFO"
      case "$cmd" in
        mysql)    mysql --version   &>>"$DB_INFO" ;;
        psql)     psql --version    &>>"$DB_INFO" ;;
        mongod)   mongod --version  &>>"$DB_INFO" ;;
        sqlite3)  sqlite3 --version &>>"$DB_INFO" ;;
      esac
      detected_db+=("$cmd")
    fi
  done

  if command -v dpkg &>/dev/null; then
    dpkg -l | grep -iE "(mysql|mariadb|postgresql|mongodb|sqlite3)" >>"$DB_PKGS" || true
  elif command -v rpm &>/dev/null; then
    rpm -qa | grep -iE "(mysql|mariadb|postgresql|mongodb|sqlite3)" >>"$DB_PKGS" || true
  else
    echo "No supported package manager" >>"$DB_PKGS"
  fi
}

# 7) DB Config File Dump

collect_db_configs() {
  echo "[*] DB 설정 파일 복사..."
  for db in "${detected_db[@]:-}"; do
    case "$db" in
      mysql)    src="/etc/mysql" ;;
      psql)     src="/etc/postgresql" ;;
      mongod)   src="/etc/mongod.conf" ;;
      sqlite3)  ;;
      *)        continue ;;
    esac

    if [[ "$db" != "sqlite3" ]]; then
      echo "  - $src → WORK_DIR$src"
      dest="${WORK_DIR}${src}"
      mkdir -p "$dest"
      if [[ -d "$src" ]]; then
        if ! cp -a "${src}/." "$dest/"; then
          echo "경고: $src 복사 실패"
          log_copy_fail "$src"
        fi
      else
        if ! cp -a "$src" "$dest/"; then
          echo "경고: $src 복사 실패"
          log_copy_fail "$src"
        fi
      fi
    else
      echo "[*] SQLite 파일 검색 및 복사..."
      while IFS= read -r dbfile; do
        dest="${WORK_DIR}${dbfile%/*}"
        mkdir -p "$dest"
        if ! cp -a "$dbfile" "$dest/"; then
          echo "경고: $dbfile 복사 실패"
          log_copy_fail "$dbfile"
        fi
      done < <(find / -type f -name '*.sqlite' -maxdepth 4 2>/dev/null)
    fi
  done
}

# 8) MySQL Data Dir Dump

collect_db_data() {
  if [[ " ${detected_db[*]:-} " == *" mysql "* ]]; then
    src="/var/lib/mysql"
    echo "[*] MySQL 데이터 디렉터리 복사..."
    dest="${WORK_DIR}${src}"
    mkdir -p "$dest"
    if ! cp -a "${src}/." "$dest/"; then
      echo "경고: $src 복사 실패"
      log_copy_fail "$src"
    fi
  fi
}

# 9) Hash Value Calculate(MD5, SHA-1)

collect_hashes() {
  echo "[*] 아티팩트 개별 파일 해쉬값 계산..."

  local algorithms=(md5sum sha1sum)

  for algo in "${algorithms[@]}"; do
    local ext
    case "$algo" in
      md5sum) ext="md5" ;;
      sha1sum) ext="sha1" ;;
    esac

    local HASH_LOG="${WORK_DIR}/hash_manifest.${ext}"

    (
      cd "$WORK_DIR"
      find . -type f \
        ! -name "$(basename "$HASH_LOG")" \
        -print0 \
        | xargs -0 "$algo"
    ) > "$HASH_LOG"

    echo "  → ${ext^^} manifest saved: $HASH_LOG"
  done
}

# Main Function

main() {
  [[ $# -le 1 ]] || usage
  ensure_root

  OUTPUT_TAR="${1:-/tmp/forensic_$(date +%Y%m%d_%H%M%S).tar.gz}"
  BASEDIR="$(dirname "$OUTPUT_TAR")"
  WORK_DIR=$(mktemp -d "${BASEDIR}/forensic.XXXXXX")
  export WORK_DIR

  COPY_FAIL_LOG="${WORK_DIR}/copy_failed.list"
  : > "$COPY_FAIL_LOG"
  export COPY_FAIL_LOG

  trap 'rm -rf "$WORK_DIR"' EXIT

  collect_os_info
  collect_dirs

  detect_web_servers
  collect_web_configs
  collect_site_artifacts

  detect_db_engines
  collect_db_configs
  collect_db_data

  collect_hashes

  echo "[*] 패키징 → $OUTPUT_TAR"
  tar czf "$OUTPUT_TAR" -C "$WORK_DIR" .
  echo "[*] 완료: $OUTPUT_TAR"
  echo "[*] 복사 실패 파일 리스트: $COPY_FAIL_LOG"
}

main "$@"

