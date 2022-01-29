import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class UserClass extends TimeStamps {
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

    @prop({ ref: () => UserClass, default: [] })
    @Field(() => [Follower])
    public followers: Ref<UserClass>[]

    @prop({ required: false, default: false })
    @Field()
    public isStaff: boolean
}

export const UserModel = getModelForClass(UserClass)

@ObjectType()
export class Follower {
    @Field()
    readonly _id: string

    @Field()
    public username: string
}
