import {
    prop,
    getModelForClass,
    Ref,
    ReturnModelType,
    pre
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'
import { MongoDocument } from '../types'
import { CommentClass } from './Comment'
import { UserClass } from './User'
@pre<PostClass>('save', function () {
    const pls = this.get('likedUsers')
    console.log(pls)
    this.likes = this.get('likedUsers').length
})
@ObjectType()
export class PostClass extends TimeStamps {
    @Field()
    readonly _id: string

    @Field(() => Date, { nullable: true })
    readonly createdAt?: Date | undefined

    @Field(() => Date, { nullable: true })
    readonly updatedAt?: Date | undefined

    @prop({ required: true })
    @Field({ nullable: true })
    public title?: string

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
    public owner: Ref<UserClass>

    @prop({
        ref: () => CommentClass,
        default: [],
        unique: false,
        sparse: true,
        required: true
    })
    @Field(() => [CommentClass])
    public comments: Ref<CommentClass>[]

    public static async findAndPopulate(
        this: ReturnModelType<typeof PostClass>,
        query?: any,
        commentLimit?: number
    ) {
        return await this.find(query || {})
            .populate({
                path: 'owner'
            })
            .populate({
                path: 'comments',
                populate: { path: 'author' },
                options: { limit: commentLimit || 10 }
            })
    }
    public static async findByIdAndPopulate(
        this: ReturnModelType<typeof PostClass>,
        id: string,
        commentLimit?: number
    ) {
        return this.findById(id)
            .populate({
                path: 'owner'
            })
            .populate({
                path: 'comments',
                populate: { path: 'author' },
                options: { limit: commentLimit || 10 }
            })
    }

    public static async populateModel(
        this: ReturnModelType<typeof PostClass>,
        post: MongoDocument<PostClass>,
        commentLimit?: number
    ) {
        return (
            await post.populate({
                path: 'owner'
            })
        ).populate({
            path: 'comments',
            populate: { path: 'author' },
            options: { limit: commentLimit || 10 }
        })
    }
}

export const PostModel = getModelForClass(PostClass, {
    schemaOptions: { timestamps: true }
})
