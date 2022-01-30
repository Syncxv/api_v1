import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware
} from 'type-graphql'

import { PostModel } from '../models'
import { isAuth } from '../jwt/isAuthMiddleware'
import { MyContext } from '../types'
import { PostClass } from '../models/Post'
import { UserClass } from '../models/User'
import { GenericError } from './userResolver'

@InputType()
class CreatePostArgs {
    @Field()
    title: string
    @Field()
    content: string
}

@ObjectType()
class DeletePostResponse {
    @Field(() => [GenericError], { nullable: true })
    errors?: GenericError[]
    @Field(() => PostClass, { nullable: true })
    post?: PostClass
}

@Resolver(_ => PostModel)
export class postReslover {
    @Query(() => [PostClass])
    async getPosts(): Promise<PostClass[]> {
        return await PostModel.find().populate({ path: 'owner' })
    }

    @Mutation(() => PostClass)
    @UseMiddleware(isAuth)
    async createPost(
        @Ctx() { payload }: MyContext,
        @Arg('options') options: CreatePostArgs
    ): Promise<PostClass> {
        console.log(payload)
        const post = await (
            await PostModel.create({
                title: options.title,
                content: options.content,
                owner: payload!.user._id
            })
        ).save()
        return await post.populate({ path: 'owner' })
    }

    @Mutation(() => DeletePostResponse)
    @UseMiddleware(isAuth)
    async deletePost(
        @Ctx() { payload }: MyContext,
        @Arg('post_id') postId: string
    ): Promise<DeletePostResponse> {
        console.log(payload)
        const post = await PostModel.findById(postId).populate({
            path: 'owner'
        })
        if (!post)
            return {
                errors: [{ message: 'WHAT POST IS THAT?' }]
            }
        console.log(post)
        if ((post!.owner as UserClass)._id.toString() !== payload.user._id) {
            return { errors: [{ message: 'ayo this aint your post' }] }
        }
        await post.delete()
        return {
            post
        }
    }

    @Query(() => UserClass)
    @UseMiddleware(isAuth)
    postAuth(@Ctx() { payload }: MyContext) {
        console.log(payload)
        return payload?.user
    }
}
