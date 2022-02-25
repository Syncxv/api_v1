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
import { UserModel } from '../models'
import { ChannelClass, ChannelModel } from '../models/Channel'
import { MyContext } from '../types'
import { GenericError } from './userResolver'
@ObjectType()
class GenericChannelResponse {
    @Field(() => [GenericError], { nullable: true })
    errors?: GenericError[]
    @Field(() => ChannelClass, { nullable: true })
    channel?: ChannelClass
}

@Resolver(_ => ChannelClass)
export class ChannelResolver {
    @Query(() => [ChannelClass])
    async getAllChannels() {
        return await ChannelModel.findAndPopulate()
    }

    @Mutation(() => GenericChannelResponse)
    async createChannel(
        @Arg('members', () => [String]) members: string[]
    ): Promise<GenericChannelResponse> {
        const users = await Promise.all(
            members.map(async s => await UserModel.findByIdAndPopulate(s))
        )
        console.log(users)
        if (users.some(s => s === null)) {
            return {
                errors: [{ message: 'one or more users are invalid' }]
            }
        }
        const channels = await ChannelModel.find({
            $and: members.map(t => ({ members: { _id: t } }))
        })
        if (channels.length)
            return { errors: [{ message: 'channel already exists eh' }] }
        const channel = await (
            await ChannelModel.create({ members })
        ).populate({ path: 'members' })
        console.log(channel)
        return {
            channel
        }
    }

    @Query(() => [ChannelClass])
    @UseMiddleware(isAuth)
    async getChannels(@Ctx() ctx: MyContext): Promise<ChannelClass[]> {
        return await ChannelModel.findAndPopulate({
            members: { $in: [ctx.payload.user._id] }
        })
    }
}
