import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'
import { UserClass } from './User'

@ObjectType()
export class CommentClass extends TimeStamps {
    @Field()
    readonly _id: string

    @Field(() => Date, { nullable: true })
    readonly createdAt?: Date | undefined

    @Field(() => Date, { nullable: true })
    readonly updatedAt?: Date | undefined

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
    public author: Ref<UserClass>
}

export const CommentModel = getModelForClass(CommentClass, {
    schemaOptions: { timestamps: true }
})
