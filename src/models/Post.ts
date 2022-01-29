import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { UserClass } from './User'

@ObjectType()
export class PostClass {
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
}

export const PostModel = getModelForClass(PostClass)
