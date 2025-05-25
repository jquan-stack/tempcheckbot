FROM node:20-alpine

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Run the bot
CMD ["node", "dist/index.js"]