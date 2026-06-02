#!/bin/bash
set -e

echo "=== IshJadvali Server Deploy ==="

# ── STEP 1: Check & install Node.js ──────────────────────────────────────────
echo "[1/8] Checking Node.js..."
NODE_VER=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
if [ "$NODE_VER" -lt "18" ] 2>/dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "  Node: $(node --version)"

# ── STEP 2: Check & install PostgreSQL ───────────────────────────────────────
echo "[2/8] Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
  echo "Installing PostgreSQL..."
  apt-get update
  apt-get install -y postgresql postgresql-contrib
  systemctl start postgresql
  systemctl enable postgresql
fi
echo "  PostgreSQL: $(psql --version)"

# Create DB user and database
echo "  Creating database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='ishjadvali'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER ishjadvali WITH PASSWORD 'StrongPass123!';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='ishjadvali'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ishjadvali OWNER ishjadvali;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ishjadvali TO ishjadvali;" 2>/dev/null || true
echo "  Database ready."

# ── STEP 3: Stop and remove old project ──────────────────────────────────────
echo "[3/8] Cleaning old project..."
if command -v pm2 &> /dev/null; then
  pm2 stop all 2>/dev/null || true
  pm2 delete all 2>/dev/null || true
fi
rm -rf /var/www/ishjadvali
rm -rf /var/www/IshJadvali
echo "  Old project removed."

# ── STEP 4: Clone new project ────────────────────────────────────────────────
echo "[4/8] Cloning project..."
mkdir -p /var/www
cd /var/www
git clone https://github.com/zaynobiddinovbiloliddin/IshJadvali.git ishjadvali
cd /var/www/ishjadvali
echo "  Cloned."

# ── STEP 5: Create .env ──────────────────────────────────────────────────────
echo "[5/8] Creating .env..."
cat > .env << 'ENVEOF'
PORT=3001
DATABASE_URL="postgresql://ishjadvali:StrongPass123!@localhost:5432/ishjadvali"
JWT_SECRET=uz24ishjadvali2026secretkey
NODE_ENV=production
ENVEOF
echo "  .env created."

# ── STEP 6: Install, migrate, seed, build ────────────────────────────────────
echo "[6/8] Installing dependencies..."
npm install

echo "  Running migrations..."
npx prisma migrate deploy

echo "  Seeding database..."
npx prisma db seed

echo "  Building frontend..."
npm run build
echo "  Build complete."

# ── STEP 7: Start with PM2 ───────────────────────────────────────────────────
echo "[7/8] Starting with PM2..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi
pm2 start server.mjs --name "ishjadvali"
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true
echo "  PM2 started."

# ── STEP 8: Setup Nginx ──────────────────────────────────────────────────────
echo "[8/8] Configuring Nginx..."
if ! command -v nginx &> /dev/null; then
  apt-get install -y nginx
fi

cat > /etc/nginx/sites-available/ishjadvali << 'NGINXEOF'
server {
    listen 80;
    server_name uzbekiston24.uz www.uzbekiston24.uz 95.111.247.157;

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

# Firewall
ufw allow 80 2>/dev/null || true
ufw allow 443 2>/dev/null || true

# ── Final check ──────────────────────────────────────────────────────────────
echo ""
echo "=== Deploy complete! ==="
pm2 status
echo ""
echo "Testing API..."
sleep 2
curl -s http://localhost:3001/api/health && echo ""
echo ""
echo "Site: http://uzbekiston24.uz"
echo ""
echo ">>> SSL uchun: bash setup-ssl.sh"
