import { prop, getModelForClass } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'

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

    @prop({ required: true })
    @Field()
    public likes: number
}

export const PostModel = getModelForClass(PostClass)
