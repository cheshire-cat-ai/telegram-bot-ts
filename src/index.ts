import { CatClient } from 'ccat-api'
import clear from 'clear'
import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { Message } from 'telegraf/typings/core/types/typegram'

clear()
dotenv.config()

if (!process.env.BOT_TOKEN) {
    throw new Error('A Bot token must be set to make it work!')
}

if (!process.env.URL) {
    throw new Error('A base URL to which connect the Cheshire Cat must be set to make it work!')
}

const bot = new Telegraf(process.env.BOT_TOKEN)

const cat = new CatClient({
	baseUrl: process.env.URL,
	port: process.env.PORT,
    authKey: process.env.AUTH_KEY,
})

bot.command('quit', async ctx => {
    if (ctx.chat.type === 'private') return
    const userStatus = (await ctx.getChatMember(ctx.from.id)).status
    if (userStatus != 'administrator' && userStatus != 'creator') {
        ctx.reply('**You must be an administrator of the group!**')
    } else {
        ctx.leaveChat()
    }
})

bot.start(ctx => ctx.reply(`__Welcome dear **${ctx.from.username}**!__`))

bot.help(ctx => ctx.reply('How can I help you?'))

const isMentioned = (msg: Message.TextMessage, username: string) => {
    const hasMention = msg.entities?.find(v => v.type == 'mention')
    if (!hasMention) return ''
    const firstMention = msg.text.slice(hasMention.offset, hasMention.length)
    if (firstMention !== `@${username}`) return ''
    return firstMention
}

const isReplied = (msg: Message.TextMessage, id: number) => msg.reply_to_message?.from?.id === id

bot.on(message('text'), ctx => {
    const msg = ctx.message.text

    if (msg.startsWith('/')) return

    const botMention = isMentioned(ctx.message, bot.botInfo?.username ?? '')

    if (botMention || isReplied(ctx.message, bot.botInfo?.id ?? 0)) {
        cat.send(msg.replace(botMention, ''))
        cat.onMessage(res => ctx.reply(res.content))
    }
})

bot.launch().then(() => {
    console.log(`Ready! Logged in as ${bot.botInfo?.username}`)
}).catch(() => {
    console.log('Unable to start the bot!')
})

bot.catch(err => {
    console.error('Error:', err)
})

console.log('Bot started!')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))