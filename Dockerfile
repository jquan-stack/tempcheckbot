FROM node:20-alpine

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Set environment variables via Docker
ENV NODE_ENV=production
ENV BOT_TOKEN=your-telegram-bot-token
ENV DATABASE_URL=postgresql://botuser:botpass@db:5432/healthbot