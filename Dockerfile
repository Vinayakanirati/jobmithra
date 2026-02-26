# ---------- Stage 1: Build client ----------
FROM node:18-slim AS client-build

WORKDIR /app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:18-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

WORKDIR /app

# ✅ Vite output folder
COPY --from=client-build /app/dist ./dist

# Install server dependencies
WORKDIR /app/server
COPY server/package.json ./
RUN npm install --omit=dev

# Install Python dependencies
COPY server/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Copy server source
COPY server/ .

# Ensure .env is available at /app/.env since WORKDIR is /app during runtime 
# and server.js uses require('dotenv').config() without specifying path
RUN if [ -f ".env" ]; then cp .env /app/.env; else echo "No .env found in server directory during build"; fi

WORKDIR /app
EXPOSE 5000

CMD ["node", "server/server.js"]