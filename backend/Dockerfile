FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies (assuming you're using pnpm based on pnpm-lock.json)
RUN npm install -g pnpm && pnpm install

# Copy specific directories and files
COPY agents/ ./agents/
COPY api/ ./api/
COPY data/ ./data/
COPY index.js ./
COPY routes.js ./

EXPOSE 3000
CMD ["pnpm", "start"]