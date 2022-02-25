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

import { isAuth } from '../jwt/isAuthMiddleware'
import { ChannelModel } from '../models/Channel'
import { MessageClass, MessageModel } from '../models/Message'
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
        @Ctx() { payload: { user } }: MyContext,
        @Arg('channel_id') channelId: string,
        @Arg('content') content: string
    ): Promise<GenericMessageResponse> {
        const channel = ChannelModel.findById(channelId)
        if (!channel)
            return { errors: [{ message: 'welp that channel doesnt exist' }] }
        const message = await MessageModel.create({
            channel: channelId,
            content,
            author: user._id
        })
        const populated = await MessageModel.populateModel(message)
        // io
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
                // .sort({ $natural: -1 })
                .limit(limit || 50)
            return MessageModel.populateModels(messages)
        }
        return []
    }
}
