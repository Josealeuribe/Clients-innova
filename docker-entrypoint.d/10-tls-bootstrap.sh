#!/bin/sh
# El problema del huevo y la gallina del TLS automatico.
#
# nginx se niega a arrancar si el archivo de `ssl_certificate` no existe. Pero
# certbot no puede emitir ese certificado si nginx no esta arriba respondiendo
# el reto http-01 por el puerto 80. Uno espera al otro y nada arranca.
#
# La salida: nginx.conf apunta SIEMPRE a /etc/nginx/certs/ (ruta fija, sin
# variables). Este script decide que hay en esa ruta:
#   - si ya existe el certificado de Let's Encrypt para $DOMAIN, lo enlaza;
#   - si no, genera uno autofirmado desechable para que nginx pueda arrancar y
#     atender el reto.
# Tras la primera emision se reinicia el contenedor y el enlace ya apunta al
# certificado real (lo hace scripts/init-letsencrypt.sh por ti).
set -e

CERT_DIR=/etc/nginx/certs
LIVE_DIR="/etc/letsencrypt/live/${DOMAIN}"

mkdir -p "$CERT_DIR"

if [ -n "${DOMAIN}" ] && [ -f "${LIVE_DIR}/fullchain.pem" ]; then
  echo "[tls] Certificado de Let's Encrypt encontrado para ${DOMAIN}."
  ln -sf "${LIVE_DIR}/fullchain.pem" "${CERT_DIR}/fullchain.pem"
  ln -sf "${LIVE_DIR}/privkey.pem"   "${CERT_DIR}/privkey.pem"
  exit 0
fi

echo "[tls] Sin certificado para '${DOMAIN:-(DOMAIN sin definir)}'."
echo "[tls] Se genera uno AUTOFIRMADO temporal: el navegador va a advertir."
echo "[tls] Emitelo con: ./scripts/init-letsencrypt.sh"

# Hay que borrar antes de escribir: si quedaron los enlaces de una ejecucion
# anterior, openssl los seguiria y sobrescribiria el certificado REAL dentro
# de /etc/letsencrypt.
rm -f "${CERT_DIR}/fullchain.pem" "${CERT_DIR}/privkey.pem"

openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
  -keyout "${CERT_DIR}/privkey.pem" \
  -out    "${CERT_DIR}/fullchain.pem" \
  -subj "/CN=${DOMAIN:-localhost}" >/dev/null 2>&1
