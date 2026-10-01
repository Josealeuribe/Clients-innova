#!/bin/sh
# certbot renueva el certificado dentro de SU contenedor, escribiendo en el
# volumen compartido. nginx no se entera: tiene el certificado cargado en
# memoria desde que arranco. Sin esta recarga periodica, el dia que renueve
# seguiria sirviendo el viejo hasta que alguien reinicie el contenedor — y se
# enterarian por el navegador de un cliente, no por un log.
#
# Recargar cada 6h es barato y no corta conexiones en curso: nginx levanta
# workers nuevos y deja morir a los viejos cuando terminan.
#
# En segundo plano a proposito: este script corre ANTES de que el entrypoint
# de la imagen ejecute nginx, asi que no puede bloquear.
(
  while :; do
    # 21600 = 6h. En segundos y no "6h" porque el sleep de busybox no siempre
    # trae el soporte de sufijos compilado.
    sleep 21600
    nginx -s reload 2>/dev/null || true
  done
) &
