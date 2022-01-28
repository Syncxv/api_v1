import { prop, getModelForClass } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
@ObjectType()
export class UserClass {
    @prop({ required: true })
    @Field()
    public username: string

    @prop({ required: true })
    @Field()
    public email: string

    @prop({ required: true, select: false })
    @Field()
    private password: string

    @prop()
    @Field()
    public avatar?: string
}

export const UserModel = getModelForClass(UserClass)

// "document" has proper types of KittenClass
