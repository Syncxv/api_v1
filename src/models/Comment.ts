import {
    prop,
    getModelForClass,
    Ref,
    ReturnModelType
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'
import { MongoDocument } from '../types'
import { UserClass } from './User'

@ObjectType()
export class CommentClass extends TimeStamps {
    @Field()
    readonly _id: string

    @Field(() => Date, { nullable: true })
    readonly createdAt?: Date | undefined

    @Field(() => Date, { nullable: true })
    readonly updatedAt?: Date | undefined

    @prop({ required: false })
    @Field({ nullable: true })
    public attachment: string

    @prop({ required: true })
    @Field()
    public content: string

    @prop({ required: false, default: 0 })
    @Field()
    public likes: number

    @prop({ ref: () => UserClass, required: false, default: [] })
    @Field(() => [String])
    public likedUsers: Ref<UserClass>[]

    @prop({
        ref: () => UserClass,
        unique: false,
        sparse: true,
        required: true
    })
    @Field(() => UserClass)
    public author: Ref<UserClass>

    public static async findByIdAndPopulate(
        this: ReturnModelType<typeof CommentClass>,
        id: string
    ) {
        return this.findById(id).populate({ path: 'author' })
    }
    public static async populateModel(
        this: ReturnModelType<typeof CommentClass>,
        comment: MongoDocument<CommentClass>
    ) {
        return await comment.populate({ path: 'author' })
    }
}

export const CommentModel = getModelForClass(CommentClass, {
    schemaOptions: { timestamps: true }
})
