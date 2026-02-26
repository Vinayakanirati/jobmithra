# ---------- Stage 1: Build client ----------
FROM node:18-slim AS client-build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:18-slim

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

WORKDIR /app

# Copy built frontend only (not full dev source)
COPY --from=client-build /app/build ./build

# Install server dependencies
WORKDIR /app/server
COPY server/package.json ./
RUN npm install --omit=dev

# Install Python dependencies
COPY server/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Copy server source
COPY server/ .

WORKDIR /app
EXPOSE 5000

CMD ["node", "server/server.js"]