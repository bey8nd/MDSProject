import { Telegraf } from 'telegraf'
import { Integration } from '.botpress'

console.info('starting integration')

class NotImplementedError extends Error {
  constructor() {
    super('Not implemented')
  }
}
 
export default new Integration({
  register: async ({ webhookUrl, ctx }) => {
    const telegraf = new Telegraf(ctx.configuration.botToken)
    await telegraf.telegram.setWebhook(webhookUrl)
  },
  unregister: async ({ ctx }) => {
    const telegraf = new Telegraf(ctx.configuration.botToken)
    await telegraf.telegram.deleteWebhook({ drop_pending_updates: true })
  },
  handler: async ({ req, client }) => {
    const data = JSON.parse(req.body!)
 
    const conversationId = data?.message?.chat?.id
    const userId = data?.message?.from?.id
    const messageId = data?.message?.message_id
 
    if (!conversationId || !userId || !messageId) {
      throw new Error("Handler didn't receive a valid message")
    }
 
    const { conversation } = await client.getOrCreateConversation({
      channel: 'group',
      tags: { '<nToThed1>:id': `${conversationId}` },
    })
 
    const { user } = await client.getOrCreateUser({
      tags: { '<nToThed1>:id': `${userId}` },
    })
 
    await client.createMessage({
      tags: { '<nToThed1>:id': `${messageId}` },
      type: 'text',
      userId: user.id,
      conversationId: conversation.id,
      payload: { text: data.message.text },
    })
  },
  actions: {},
  channels: {
    group: {
      messages: {
        text: async ({ payload , ctx, conversation, ack }) => {
          const client = new Telegraf(ctx.configuration.botToken)
          const message = await client.telegram.sendMessage(conversation.tags['<nToThed1>:id']!, payload.text)
          await ack({ tags: { '<nToThed1>:id': `${message.message_id}` } })
        },
      },
    },
  },
})