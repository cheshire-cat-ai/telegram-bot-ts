import { Message } from 'telegraf/typings/core/types/typegram'
import { ChatType } from '@utils/enums'

export const isMentioned = (msg: Message.TextMessage, username: string | undefined) => {
    const hasMention = msg.entities?.find(v => v.type == 'mention')
    if (!hasMention) return ''
    const firstMention = msg.text.slice(hasMention.offset, hasMention.length)
    if (firstMention !== `@${username}`) return ''
    return firstMention
}

export const isReplied = (msg: Message.TextMessage, id: number | undefined) => msg.reply_to_message?.from?.id === id

export const getChatAccess = (accesses: string | undefined) => {
    return accesses ? accesses.split('|').map(el => el as ChatType) : [ChatType.Group, ChatType.SuperGroup]
}