import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'
import { UserClass } from './User'

@ObjectType()
export class MessageClass extends TimeStamps {
    @Field()
    readonly _id: string

    @prop({ required: true })
    @Field()
    public channel_id: string

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
}

export const CommentModel = getModelForClass(MessageClass, {
    schemaOptions: { timestamps: true }
})
