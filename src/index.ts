import { CatClient, AcceptedFileTypes, AcceptedFileType } from 'ccat-api'
import clear from 'clear'
import dotenv from 'dotenv'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { isMentioned, isReplied } from '@utils/helpers'

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
        ctx.replyWithMarkdownV2('*You must be an administrator of the group\\!*')
    } else {
        ctx.leaveChat()
    }
})

bot.command('url', async ctx => {
    if (ctx.chat.type === 'private') return
    const userStatus = (await ctx.getChatMember(ctx.from.id)).status
    if (userStatus != 'administrator' && userStatus != 'creator') {
        ctx.replyWithMarkdownV2('*You must be an administrator of the group\\!*')
    } else {
        const url = ctx.message.text.replace('/url ', '')
        await ctx.replyWithMarkdownV2('*Uploading url to the Rabbit Hole\\.\\.\\.*')
        await cat.api?.rabbitHole.uploadUrl({ url })
        ctx.replyWithMarkdownV2(`*Website \`${url}\` uploaded with success\\!*`)
    }
})

bot.start(ctx => ctx.replyWithMarkdownV2(`__Welcome dear *${ctx.from.username}*\\!__`))

bot.help(ctx => ctx.replyWithMarkdownV2('*How can I help you?*'))

bot.on(message('text'), ctx => {
    const msg = ctx.message.text

    if (msg.startsWith('/')) return

    const isPrivateChat = ctx.chat.type == 'private'
    const botMention = isMentioned(ctx.message, bot.botInfo?.username)
    if (!isPrivateChat && !botMention && !isReplied(ctx.message, bot.botInfo?.id)) return;

    cat.send(msg.replace(botMention, ''))
    cat.onMessage(res => ctx.reply(res.content))
})

bot.on(message('document'), async ctx => {
    const document = ctx.message.document
    if (!AcceptedFileTypes.includes(document.mime_type as AcceptedFileType)) {
        ctx.replyWithMarkdownV2(`*The mime type \`${document.mime_type}\` is not supported\\!*`)
        return
    }
    const documentLink = (await bot.telegram.getFileLink(document)).href
    const blob = await fetch(documentLink).then(r => r.blob())
    await cat.api?.rabbitHole.uploadFile({ file: blob })
    ctx.replyWithMarkdownV2(`*The file \`${document.file_name}\` was uploaded with success\\!*`)
})

bot.on(message('location'), async ctx => {
    const location = ctx.message.location

    console.log(location)
})

/* bot.on(message('photo'), async ctx => {
    const photo = ctx.message.photo

    photo.forEach(p => {
        const photoLink = (await bot.telegram.getFileLink(p.file_id)).href
        console.log(photoLink)
    })
})

bot.on(message('voice'), async ctx => {
    const audio = ctx.message.voice
    const audioLink = (await bot.telegram.getFileLink(audio)).href

    console.log(audioLink)
}) */

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