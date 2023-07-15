import { CatClient } from 'ccat-api';
import clear from 'clear';
import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

clear();
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');

const cat = new CatClient({
	baseUrl: process.env.URL ?? 'localhost',
	port: process.env.PORT,
})

bot.command('quit', async ctx => {
    await ctx.leaveChat();
});

bot.start(ctx => ctx.reply('Welcome dear user!'));

bot.help(ctx => ctx.reply('Send me a sticker'));

bot.on(message('text'), ctx => {
    cat.send(ctx.message.text);
    cat.onMessage(res => ctx.reply(res.content));
});

bot.launch();

console.log(`Ready! Logged in as ${bot.botInfo?.username}`);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));