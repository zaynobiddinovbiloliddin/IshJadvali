#!/bin/bash
set -e

echo "=== IshJadvali Server Deploy ==="
echo "Tur: fresh yoki update? (fresh/update) [default: update]"
read -r DEPLOY_TYPE
DEPLOY_TYPE=${DEPLOY_TYPE:-update}

# ── STEP 1: Check & install Node.js ──────────────────────────────────────────
echo "[1] Node.js tekshirilmoqda..."
NODE_VER=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
if [ "$NODE_VER" -lt "18" ] 2>/dev/null; then
  echo "Node.js 20 o'rnatilmoqda..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "  Node: $(node --version)"

if [ "$DEPLOY_TYPE" = "fresh" ]; then

  # ── FRESH DEPLOY ───────────────────────────────────────────────────────────

  # Stop old project
  echo "[2] Eski loyiha to'xtatilmoqda..."
  if command -v pm2 &> /dev/null; then
    pm2 stop ishjadvali 2>/dev/null || true
    pm2 delete ishjadvali 2>/dev/null || true
  fi

  # Backup existing data before wiping
  if [ -d /var/www/ishjadvali/data ]; then
    echo "  Ma'lumotlar backup qilinmoqda..."
    cp -r /var/www/ishjadvali/data /tmp/ishjadvali-data-backup
    echo "  Backup: /tmp/ishjadvali-data-backup"
  fi

  rm -rf /var/www/ishjadvali
  rm -rf /var/www/IshJadvali

  # Clone
  echo "[3] Loyiha yuklanmoqda..."
  mkdir -p /var/www
  cd /var/www
  git clone https://github.com/zaynobiddinovbiloliddin/IshJadvali.git ishjadvali
  cd /var/www/ishjadvali

  # Restore data if backup exists
  if [ -d /tmp/ishjadvali-data-backup ]; then
    echo "  Ma'lumotlar qayta tiklanmoqda..."
    rm -rf /var/www/ishjadvali/data
    cp -r /tmp/ishjadvali-data-backup /var/www/ishjadvali/data
    echo "  Ma'lumotlar qayta tiklandi."
  fi

  # Create .env
  echo "[4] .env yaratilmoqda..."
  echo "  Telegram Bot Token kiriting (bo'sh qoldirsa o'tkazib yuboriladi):"
  read -r TG_TOKEN
  echo "  Telegram Chat ID kiriting:"
  read -r TG_CHAT

  cat > .env << ENVEOF
PORT=3001
JWT_SECRET=uz24ishjadvali2026secretkey
NODE_ENV=production
TELEGRAM_BOT_TOKEN=${TG_TOKEN}
TELEGRAM_CHAT_ID=${TG_CHAT}
ENVEOF
  echo "  .env yaratildi."

  # Install & build
  echo "[5] Kutubxonalar o'rnatilmoqda..."
  npm install --production=false

  echo "  Frontend build qilinmoqda..."
  npm run build
  echo "  Build tayyor."

  # Start PM2
  echo "[6] PM2 bilan ishga tushirilmoqda..."
  if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
  fi
  pm2 start server.mjs --name "ishjadvali"
  pm2 save
  pm2 startup 2>/dev/null | grep "sudo" | bash 2>/dev/null || true
  echo "  PM2 ishga tushdi."

  # Nginx
  echo "[7] Nginx sozlanmoqda..."
  if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
  fi

  cat > /etc/nginx/sites-available/ishjadvali << 'NGINXEOF'
server {
    listen 80;
    server_name uzbekiston24.uz www.uzbekiston24.uz 95.111.247.157;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINXEOF

  ln -sf /etc/nginx/sites-available/ishjadvali /etc/nginx/sites-enabled/ishjadvali
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx

  ufw allow 80 2>/dev/null || true
  ufw allow 443 2>/dev/null || true

else

  # ── UPDATE DEPLOY ──────────────────────────────────────────────────────────

  APP_DIR="/var/www/ishjadvali"
  if [ ! -d "$APP_DIR" ]; then
    echo "XATO: $APP_DIR topilmadi. 'fresh' deploy qiling."
    exit 1
  fi

  cd "$APP_DIR"

  echo "[2] Yangi kod yuklanmoqda (git pull)..."
  git pull origin main
  echo "  Kod yangilandi."

  echo "[3] Kutubxonalar tekshirilmoqda..."
  npm install --production=false
  echo "  Kutubxonalar tayyor."

  echo "[4] Frontend build qilinmoqda..."
  npm run build
  echo "  Build tayyor."

  echo "[5] PM2 qayta ishga tushirilmoqda..."
  pm2 restart ishjadvali 2>/dev/null || pm2 start server.mjs --name "ishjadvali"
  pm2 save
  echo "  PM2 qayta ishga tushdi."

fi

# ── Final check ─────────────────────────────────────────────────────────────
echo ""
echo "=== Deploy tugadi! ==="
pm2 status
echo ""
sleep 2
echo "API tekshiruvi:"
curl -s http://localhost:3001/api/health && echo ""
echo ""
echo "Site: http://95.111.247.157"
echo "SSL uchun: bash setup-ssl.sh"
