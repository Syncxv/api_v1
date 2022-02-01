import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'
import { UserClass } from './User'

@ObjectType()
export class Image extends TimeStamps {
    @Field()
    readonly _id: string

    @prop({ required: true })
    @Field()
    public data: string

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
    public author: Ref<UserClass>
}

export const CommentModel = getModelForClass(Image, {
    schemaOptions: { timestamps: true }
})
