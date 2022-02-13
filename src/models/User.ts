import { prop, getModelForClass, Ref, pre } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'

@pre<UserClass>('validate', function () {
    if (!this.displayName) {
        this.displayName = this.username
    }
})
@ObjectType()
export class UserClass extends TimeStamps {
    @Field()
    readonly _id: string

    @Field(() => Date, { nullable: true })
    readonly createdAt?: Date | undefined

    @Field(() => Date, { nullable: true })
    readonly updatedAt?: Date | undefined

    @prop({ required: true })
    @Field()
    public username: string

    @prop({ required: false })
    @Field()
    public displayName: string

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
