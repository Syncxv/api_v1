import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'
import { CommentClass } from './Comment'
import { UserClass } from './User'

@ObjectType()
export class PostClass extends TimeStamps {
    @Field()
    readonly _id: string

    @prop({ required: true })
    @Field()
    public title: string

    @prop({ required: true })
    @Field()
    public content: string

    @prop({ required: false, default: 0 })
    @Field()
    public likes: number

    @prop({
        ref: () => UserClass,
        unique: false,
        sparse: true,
        required: true
    })
    @Field(() => UserClass)
    public owner: Ref<UserClass>

    @prop({
        ref: () => CommentClass,
        default: [],
        unique: false,
        sparse: true,
        required: true
    })
    @Field(() => [CommentClass])
    public comments: Ref<CommentClass>[]
}

export const PostModel = getModelForClass(PostClass)
