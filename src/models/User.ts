import { prop, getModelForClass } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'

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
    private password: string

    @prop({ required: false })
    @Field({ nullable: true })
    public avatar?: string
}

export const UserModel = getModelForClass(UserClass)
