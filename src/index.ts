import { Telegraf, Markup } from 'telegraf';
import { createRecord, getRecords, getNextFeed } from './services/recordService.ts';
import { pool } from './services/db.ts';

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(ctx => ctx.reply('Welcome! Use /record, /history, or /nextfeed'));

bot.command('record', async ctx => {
  ctx.reply('Select a medication:', Markup.inlineKeyboard([
    [Markup.button.callback('Panadol', 'med_panadol')],
    [Markup.button.callback('Ibuprofen', 'med_ibuprofen')]
  ]));
});

let pendingRecord: Record<string, { childName: string; temp: number; medication: string }> = {};

bot.action(/med_.+/, async ctx => {
  const userId = ctx.from?.id;
  const medication = ctx.match[0].replace('med_', '');
  if (!userId) return;
  pendingRecord[userId] = { childName: '', temp: 0, medication };
  ctx.reply(`Selected ${medication}. Please send: childName temperature dosage (e.g., John 38.5 5)`);
});

bot.on('text', async ctx => {
  const msg = ctx.message.text.split(' ');
  const userId = ctx.from?.id;

  if (!userId || !pendingRecord[userId]) return;

  if (msg.length === 3) {
    const [childName, tempStr, dosageStr] = msg;
    const temp = parseFloat(tempStr);
    const dosage = parseFloat(dosageStr);
    const medication = pendingRecord[userId].medication as 'Panadol' | 'Ibuprofen';

    await createRecord(userId, childName, temp, medication, dosage);
    ctx.reply(`Record added for ${childName} with ${medication}!`);
    delete pendingRecord[userId];
  }
});

bot.command('history', async ctx => {
  ctx.reply('Send: childName range (e.g., John 6h, 12h, 1d, 3d, or 7d)');
});

bot.hears(/^([\w\s]+)\s+(6h|12h|1d|3d|7d)$/i, async ctx => {
  const [childName, range] = ctx.match.slice(1);
  const userId = ctx.from?.id;
  if (userId) {
    const records = await getRecords(userId, childName.trim(), range as any);
    ctx.reply(records.map(r => `Temp: ${r.temperature}, ${r.medication}, ${r.dosage}ml at ${new Date(r.timestamp).toLocaleString()}`).join('\n') || 'No records.');
  }
});

bot.command('nextfeed', async ctx => {
  ctx.reply('Send: childName');
});

bot.hears(/^\w+$/, async ctx => {
  const childName = ctx.message.text.trim();
  const userId = ctx.from?.id;
  if (userId) {
    const feed = await getNextFeed(userId, childName);
    ctx.reply(`Next feed for ${childName}: ${feed.medication} at ${feed.time}`);
  }
});

bot.launch();