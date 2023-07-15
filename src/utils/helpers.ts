import { Message } from 'telegraf/typings/core/types/typegram'

export const isMentioned = (msg: Message.TextMessage, username: string | undefined) => {
    const hasMention = msg.entities?.find(v => v.type == 'mention')
    if (!hasMention) return ''
    const firstMention = msg.text.slice(hasMention.offset, hasMention.length)
    if (firstMention !== `@${username}`) return ''
    return firstMention
}

export const isReplied = (msg: Message.TextMessage, id: number | undefined) => msg.reply_to_message?.from?.id === id