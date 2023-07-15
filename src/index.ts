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
    authKey: process.env.AUTH_KEY,
})

bot.command('quit', async ctx => {
    if (ctx.chat.type === 'private') return
    const userStatus = (await ctx.getChatMember(ctx.message.from.id)).status
    if (userStatus != 'administrator' && userStatus != 'creator') {
        ctx.reply('**You must be an administrator of the group!**');
    } else {
        ctx.leaveChat();
    }
});

bot.start(ctx => ctx.reply('Welcome dear user!'));

bot.help(ctx => ctx.reply('How can I help you?'));

bot.on(message('text'), ctx => {
    cat.send(ctx.message.text);
    cat.onMessage(res => ctx.reply(res.content));
});

bot.launch().then(() => {
    console.log(`Ready! Logged in as ${bot.botInfo?.username}`);
}).catch(() => {
    console.log('Unable to start the bot!');
});

bot.catch(err => {
    console.error('Error:', err)
})

console.log('Bot started!');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));