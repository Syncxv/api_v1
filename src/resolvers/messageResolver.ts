import {
    Arg,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware
} from 'type-graphql'
import { SOCKET_ACTIONS } from '../constants'

import { isAuth } from '../jwt/isAuthMiddleware'
import { ChannelModel } from '../models/Channel'
import { MessageClass, MessageModel } from '../models/Message'
import { usersMap } from '../socket/listeners/mainListner'
import { MyContext } from '../types'
import { GenericError } from './userResolver'

@ObjectType()
class GenericMessageResponse {
    @Field(() => [GenericError], { nullable: true })
    errors?: GenericError[]
    @Field(() => MessageClass, { nullable: true })
    message?: MessageClass
}

@Resolver(_ => MessageClass)
export class MessageResolver {
    @Mutation(() => GenericMessageResponse)
    @UseMiddleware(isAuth)
    async createMessage(
        @Ctx() { payload: { user }, io }: MyContext,
        @Arg('channel_id') channelId: string,
        @Arg('content') content: string
    ): Promise<GenericMessageResponse> {
        const channel = await ChannelModel.findById(channelId)
        if (!channel)
            return { errors: [{ message: 'welp that channel doesnt exist' }] }
        const message = await MessageModel.create({
            channel: channelId,
            content,
            author: user._id
        })
        const populated = await MessageModel.populateModel(message)
        console.log(usersMap)
        const recipiant = usersMap.get(
            channel.members.find(s => s?.toString() !== user._id)?.toString() ||
                'well'
        )
        if (recipiant) {
            io.to(recipiant.socketId).emit(
                SOCKET_ACTIONS.RECIVE_MESSAGE,
                message
            )
        }
        return { message: populated }
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
            return await (await MessageModel.populateModels(messages)).reverse()
        }
        const message = await await MessageModel.findById(before)
        if (!message) return []
        const messages = await MessageModel.aggregate([
            { $match: { createdAt: { $lt: message.createdAt } } }
        ])
            .sort({ createdAt: -1 })
            .limit(50)
        const realMessages = await MessageModel.populateModels(messages)
        return realMessages.reverse()
    }
}
