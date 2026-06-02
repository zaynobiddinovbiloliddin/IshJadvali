#!/bin/bash
set -e

DOMAIN="uzbekiston24.uz"
WWW_DOMAIN="www.uzbekiston24.uz"
EMAIL="admin@uzbekiston24.uz"
APP_DIR="/var/www/ishjadvali"

echo "=== SSL Setup: $DOMAIN ==="
echo ""

# ── Preflight: DNS check ──────────────────────────────────────────────────────
echo "[1/5] DNS tekshiruvi..."
SERVER_IP=$(curl -s https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
DOMAIN_IP=$(getent hosts "$DOMAIN" | awk '{print $1}' 2>/dev/null || dig +short "$DOMAIN" 2>/dev/null | tail -1)

echo "  Server IP  : $SERVER_IP"
echo "  $DOMAIN IP : $DOMAIN_IP"

if [ -z "$DOMAIN_IP" ]; then
  echo ""
  echo "  XATO: $DOMAIN uchun DNS yozuvi topilmadi!"
  echo "  Domeningiz DNS sozlamalarida A yozuvini qo'shing:"
  echo "    Tur: A"
  echo "    Host: @"
  echo "    Qiymat: $SERVER_IP"
  echo "  (www uchun ham shunday A yozuvi kerak)"
  echo ""
  read -p "  DNS tayyor bo'ldi, davom etaymi? (y/n): " yn
  [ "$yn" != "y" ] && exit 1
else
  echo "  DNS OK."
fi

# ── STEP 2: Install Certbot ───────────────────────────────────────────────────
echo ""
echo "[2/5] Certbot o'rnatilmoqda..."
apt-get update -qq
apt-get install -y certbot python3-certbot-nginx -qq
echo "  Certbot: $(certbot --version 2>&1 | head -1)"

# ── STEP 3: Update Nginx config (HTTP only, no SSL yet) ──────────────────────
echo ""
echo "[3/5] Nginx konfiguratsiyasi yangilanmoqda..."
cat > /etc/nginx/sites-available/ishjadvali << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/ishjadvali /etc/nginx/sites-enabled/ishjadvali
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
echo "  Nginx yangilandi."

# ── STEP 4: Get SSL certificate ───────────────────────────────────────────────
echo ""
echo "[4/5] SSL sertifikat olinmoqda (Let's Encrypt)..."
certbot --nginx \
  -d "$DOMAIN" \
  -d "$WWW_DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --redirect

echo "  SSL sertifikat muvaffaqiyatli o'rnatildi!"

# ── STEP 5: Auto-renewal ──────────────────────────────────────────────────────
echo ""
echo "[5/5] Avtomatik yangilash sozlanmoqda..."
systemctl enable certbot.timer 2>/dev/null || true
systemctl start certbot.timer 2>/dev/null || true

# Cron fallback (agar timer ishlamasa)
if ! systemctl is-active --quiet certbot.timer 2>/dev/null; then
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --nginx") | crontab -
  echo "  Cron orqali avtomatik yangilash qo'shildi (har kuni 03:00)."
else
  echo "  systemd timer orqali avtomatik yangilash yoqildi."
fi

# Dry-run test
certbot renew --dry-run --quiet && echo "  Dry-run: OK" || echo "  Dry-run: tekshiring"

# ── Final: Update .env ────────────────────────────────────────────────────────
echo ""
echo "Updating .env..."
if [ -f "$APP_DIR/.env" ]; then
  grep -q "^NEXTAUTH_URL=" "$APP_DIR/.env" \
    && sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|" "$APP_DIR/.env" \
    || echo "NEXTAUTH_URL=https://$DOMAIN" >> "$APP_DIR/.env"
  echo "  .env yangilandi."
fi

# Restart app
cd "$APP_DIR"
pm2 restart ishjadvali 2>/dev/null || true

# ── Final check ───────────────────────────────────────────────────────────────
echo ""
echo "=== SSL Setup tugadi! ==="
echo ""
nginx -t && systemctl reload nginx
echo ""
echo "Tekshirish:"
echo "  HTTP  → HTTPS yo'naltirish:"
echo "    curl -I http://$DOMAIN"
echo "  HTTPS:"
echo "    curl -I https://$DOMAIN"
echo ""
echo "Sertifikat muddati:"
certbot certificates 2>/dev/null | grep -A3 "Domains:" | head -8 || true
echo ""
echo "  Browser da oching: https://$DOMAIN"
