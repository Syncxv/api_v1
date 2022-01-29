import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { PostModel } from '.'
import { PostClass } from './Post'

@ObjectType()
export class UserClass {
    @Field()
    readonly _id: string

    @prop({ required: true })
    @Field()
    public username: string

    @prop({ required: true })
    @Field()
    public email: string

    @prop({ required: true, select: false })
    public password: string

    @prop({ required: false })
    @Field({ nullable: true })
    public avatar?: string
}

export const UserModel = getModelForClass(UserClass)
