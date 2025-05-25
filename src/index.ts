import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { Record } from '@prisma/client/runtime/library';
import { createRecord, getRecords, getNextFeed } from './services/recordService';

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN as string, { polling: true });

bot.onText(/\/start/, (msg: { chat: { id: any; }; }) => {
  bot.sendMessage(msg.chat.id, `Welcome to Health Bot 👶\nUse /record, /records, or /nextfeed to manage your child's medication.`);
});

bot.onText(/\/record/, (msg: { chat: { id: any; }; }) => {
  bot.sendMessage(msg.chat.id, `Please enter data in this format:\nchildName,temperature,medication,ml\n\nExample: John,38.5,Panadol,5`);
});

bot.on('message', async (msg: any) => {
  const chatId = msg.chat.id;

  if (msg.text && !msg.text.startsWith('/')) {
    const [child, temp, med, ml] = msg.text.split(',');
    if (child && temp && med && ml) {
      await createRecord(chatId, child.trim(), parseFloat(temp), med.trim() as any, parseFloat(ml));
      bot.sendMessage(chatId, `✅ Record saved for ${child.trim()}`);
    }
  }
});

bot.onText(/\/records (.+)/, async (msg: { chat: { id: number; }; }, match: any) => {
  const [child, range] = match![1].split(',');
  const records = await getRecords(msg.chat.id, child.trim(), range.trim() as any);
  const text = records.map((r: any) => `${new Date(r.timestamp).toLocaleString()} | ${r.temperature}°C | ${r.medication} (${r.dosage}ml)`).join('\n') || 'No records found';
  bot.sendMessage(msg.chat.id, text);
});

bot.onText(/\/nextfeed (.+)/, async (msg: { chat: { id: number; }; }, match: any) => {
  const child = match![1].trim();
  const next = await getNextFeed(msg.chat.id, child);
  bot.sendMessage(msg.chat.id, `Next dose: ${next.medication} at ${next.time}`);
});