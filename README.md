# Telegram Health Bot

This bot allows you to track your child's temperature and medication schedule (Panadol or Ibuprofen) through Telegram.

## Features
- Add temperature + medication record.
- View medication history over time ranges.
- View the next eligible feed time based on dosage rules.

## Requirements
- Docker + Docker Compose
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

## Setup Instructions

### 1. Clone & Navigate to the Project
```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Replace Environment Variables
Edit `docker-compose.yml` and replace:
```
BOT_TOKEN: your-telegram-bot-token
```
with your actual bot token.

### 3. Create Database Schema
Run the following commands to initialize the database schema:
```bash
docker compose up -d db
sleep 5
docker exec -i telegram-db psql -U botuser -d healthbot < schema.sql
```
> Ensure `schema.sql` contains the SQL table definitions listed in this repo.

### 4. Build & Run the Bot
```bash
docker compose up --build
```

### 5. Talk to Your Bot
Start a chat with your bot on Telegram and use:
- `/record` to start a record
- `/history` to see past records
- `/nextfeed` to know the next medication time

## Development Notes
- Code written in TypeScript and compiled to `dist/`.
- Use `npm run build` to compile.

## Stopping Services
```bash
docker compose down
```

## License
MIT
