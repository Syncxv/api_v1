import {
    prop,
    getModelForClass,
    Ref,
    ReturnModelType
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'
import { MongoDocument } from '../types'
import { ChannelClass } from './Channel'
import { UserClass } from './User'

@ObjectType()
export class MessageClass extends TimeStamps {
    @Field()
    readonly _id: string

    @prop({
        ref: () => ChannelClass,
        unique: false,
        sparse: true,
        required: true
    })
    @Field(() => ChannelClass)
    public channel: Ref<ChannelClass>

    @prop({ required: true })
    @Field()
    public content: string

    @prop({
        ref: () => UserClass,
        unique: false,
        sparse: true,
        required: true
    })
    @Field(() => UserClass)
    public author: Ref<UserClass>

    public static async populateModel(
        this: ReturnModelType<typeof MessageClass>,
        message: MongoDocument<MessageClass>
    ) {
        return await message.populate([
            { path: 'author' },
            { path: 'channel', populate: { path: 'members' } }
        ])
    }
    public static async populateModels(
        this: ReturnModelType<typeof MessageClass>,
        messages: MongoDocument<MessageClass>[]
    ) {
        return await Promise.all(
            messages.map(
                async s =>
                    await s.populate([
                        { path: 'author' },
                        { path: 'channel', populate: { path: 'members' } }
                    ])
            )
        )
    }
}

export const MessageModel = getModelForClass(MessageClass, {
    schemaOptions: { timestamps: true }
})
