import { prop, getModelForClass } from '@typegoose/typegoose'
import joiful from 'joiful'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class UserClass {
    @Field()
    readonly _id: string

    @prop({ required: true, unique: true })
    @Field()
    public username: string

    @prop({ required: true, unique: true })
    @Field()
    public email: string

    @prop({ required: true, select: false })
    public password: string

    @prop({ required: false })
    @Field({ nullable: true })
    public avatar?: string
}

export const UserModel = getModelForClass(UserClass)
