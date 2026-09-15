# syntax=docker/dockerfile:1

# Landing de clientes (React + Vite). Se compila a estaticos y se sirve con
# nginx: en produccion no hay motivo para tener un Node vivo sirviendo dist/.

# --- Compilacion ------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# La version de pnpm se fija igual que en .mise.toml para que el lockfile se
# resuelva exactamente igual dentro y fuera del contenedor.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Vite hornea las variables VITE_* y `base` en el bundle, asi que esto son
# ARG de build y no variables de entorno del contenedor: cambiarlas exige
# recompilar.
#
# VITE_API_URL vacio = llamadas relativas (/api/...), resueltas por el proxy
# de nginx hacia `api`. Bajo innovaclub.com.co viaja con el prefijo del
# subpath (/cucuta) para que el navegador pida /cucuta/api/... -- eso cae de
# vuelta en el location /cucuta/ del Nginx del host, que lo reenvia aqui
# adentro ya sin el prefijo (ver innovaclub-infra/).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# `base` de Vite -- FIGMA_PUBLIC_URL es el nombre historico que ya lee
# vite.config.ts (heredado del scaffolding de Figma Make); se reusa en vez
# de inventar uno nuevo. Vacio = base '/'. Bajo innovaclub.com.co va
# /cucuta, para que assets y rutas internas carguen bien desde ese subpath.
ARG FIGMA_PUBLIC_URL=""
ENV FIGMA_PUBLIC_URL=$FIGMA_PUBLIC_URL
RUN pnpm build

# --- Imagen final -----------------------------------------------------------
FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1
