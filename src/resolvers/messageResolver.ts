import {
    Arg,
    Ctx,
    Mutation,
    Query,
    Resolver,
    UseMiddleware
} from 'type-graphql'
import { isAuth } from '../jwt/isAuthMiddleware'
import { MessageClass, MessageModel } from '../models/Message'
import { MyContext } from '../types'
@Resolver(_ => MessageClass)
export class MessageResolver {
    @Mutation(() => MessageClass)
    @UseMiddleware(isAuth)
    async createMessage(
        @Ctx() { payload: { user } }: MyContext,
        @Arg('channel_id') channelId: string,
        @Arg('content') content: string
    ): Promise<MessageClass> {
        const message = await MessageModel.create({
            channel: channelId,
            content,
            author: user._id
        })
        console.log(message)
        return await message.populate([
            { path: 'author' },
            { path: 'channel', populate: { path: 'members' } }
        ])
    }

    @Query(() => [MessageClass])
    @UseMiddleware(isAuth)
    async getMessages(
        // @Ctx() { payload: { user } }: MyContext,
        @Arg('channel_id') channelId: string,
        @Arg('limit', { nullable: true }) limit?: number,
        @Arg('before', { nullable: true }) before?: string
    ) {
        if (!before) {
            const messages = await MessageModel.find({
                channel: channelId
            })
                .sort({ $natural: -1 })
                .limit(limit || 50)
            return MessageModel.populateModels(messages)
        }
        return []
    }
}
