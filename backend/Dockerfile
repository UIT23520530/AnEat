# Use Node.js LTS version with Debian (better compatibility with Prisma)
FROM node:20-slim AS builder

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-slim AS production

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
