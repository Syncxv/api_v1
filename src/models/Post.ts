import {
    prop,
    getModelForClass,
    Ref,
    ReturnModelType
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import {
    BeAnObject,
    IObjectWithTypegooseFunction
} from '@typegoose/typegoose/lib/types'
import { Document } from 'mongoose'
import { Field, ObjectType } from 'type-graphql'
import { CommentClass } from './Comment'
import { UserClass } from './User'

@ObjectType()
export class PostClass extends TimeStamps {
    @Field()
    readonly _id: string

    @prop({ required: true })
    @Field()
    public title: string

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
        this: ReturnModelType<typeof PostClass>
    ) {
        return this.find()
            .populate({
                path: 'owner'
            })
            .populate({ path: 'comments', populate: { path: 'author' } })
    }
    public static async findByIdAndPopulate(
        this: ReturnModelType<typeof PostClass>,
        id: string
    ) {
        return this.findById(id)
            .populate({
                path: 'owner'
            })
            .populate({ path: 'comments', populate: { path: 'author' } })
    }

    public static async populateModel(
        this: ReturnModelType<typeof PostClass>,
        post: Document<string, BeAnObject, any> &
            PostClass &
            IObjectWithTypegooseFunction & {
                _id: string
            }
    ) {
        return (
            await post.populate({
                path: 'owner'
            })
        ).populate({
            path: 'comments',
            populate: { path: 'author' }
        })
    }
}

export const PostModel = getModelForClass(PostClass, {
    schemaOptions: { timestamps: true }
})
