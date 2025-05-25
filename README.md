```bash
# Setup Instructions

## 1. Clone the project
$ git clone <repo-url>
$ cd telegram-health-bot

## 2. Create .env file
Create a `.env` file in the project root:

BOT_TOKEN=your-telegram-bot-token
DATABASE_URL=postgresql://botuser:botpass@db:5432/healthbot
POSTGRES_USER=botuser
POSTGRES_PASSWORD=botpass
POSTGRES_DB=healthbot

## 3. Setup Prisma
$ npx prisma generate
$ npx prisma migrate dev --name init

## 4. Build Docker Image
$ docker compose build

## 5. Run the bot
$ docker compose up

## 6. Access Logs
$ docker logs -f telegram_health_bot
```
