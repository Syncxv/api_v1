import {
    prop,
    getModelForClass,
    Ref,
    pre,
    ReturnModelType
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'
import { MongoDocument } from '../types'

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

    @prop({
        ref: () => UserClass,
        default: [] /** options: {limit: 10} 
                DOES THis LIMIT HOW MUCH I CAN PUT IN IT OR DOES IT LIMIT HOW MUCH GETS SENT BACK?!?!?!?!?!?!?! 
                ill figure this out later because i cant be botherd to make 10 accounts
            */
    })
    @Field(() => [Follower])
    public followers: Ref<UserClass>[]

    @prop({ required: false, default: false })
    @Field()
    public isStaff: boolean

    public static async findAndPopulate(
        this: ReturnModelType<typeof UserClass>,
        query?: any
    ) {
        return await this.find(query || {}).populate({
            path: 'followers',
            select: ['username', 'id']
        })
    }

    public static async findByIdAndPopulate(
        this: ReturnModelType<typeof UserClass>,
        id: string
    ) {
        return this.findById(id).populate({
            path: 'followers',
            select: ['username', 'id']
        })
    }

    public static async populateModel(
        this: ReturnModelType<typeof UserClass>,
        post: MongoDocument<UserClass>
    ) {
        return await post.populate({
            path: 'followers',
            select: ['username', 'id']
        })
    }
}

export const UserModel = getModelForClass(UserClass)

@ObjectType()
export class Follower {
    @Field()
    readonly _id: string

    @Field()
    public username: string
}
