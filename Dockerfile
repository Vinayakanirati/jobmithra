# Use a Node image that also has Python
FROM node:18-slim

# Install Python and Chrome dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    chromium \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Selenium
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Create app directory
WORKDIR /app

# Install client dependencies
COPY package*.json ./
# Use --include=optional to ensure rollup binaries for Linux are installed
RUN npm install --include=optional

# Copy client source and build
COPY . .
RUN npm run build

# Install server dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install

# Install Python dependencies
COPY server/requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Final setup
WORKDIR /app
EXPOSE 5000

# Start the application
CMD ["node", "server/server.js"]
