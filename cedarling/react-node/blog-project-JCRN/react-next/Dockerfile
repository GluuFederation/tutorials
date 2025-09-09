# Stage 1: Build the application
FROM node:22-alpine AS builder

RUN deluser --remove-home node \
    && addgroup -S node -g 1000 \
    && adduser -S -G node -u 1000 node

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY --chown=1000:1000 ./package*.json /app/

# Install dependencies using npm
RUN npm install

# Copy the rest of the application
COPY --chown=1000:1000 . /app

# Stage 2: Serve the application
FROM node:22-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Install production dependencies only
RUN npm ci --only=production

# Environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"]