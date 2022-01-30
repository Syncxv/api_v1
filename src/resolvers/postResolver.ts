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
import { CommentClass, CommentModel } from '../models/Comment'

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

@ObjectType()
class CommentResponse {
    @Field(() => [GenericError], { nullable: true })
    errors?: GenericError[]
    @Field(() => PostClass, { nullable: true })
    post?: PostClass
}

@Resolver(_ => PostModel)
export class postReslover {
    @Query(() => [PostClass])
    async getPosts(): Promise<PostClass[]> {
        return await PostModel.findAndPopulate()
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
        const post = await PostModel.findByIdAndPopulate(postId)
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
    @Mutation(() => CommentResponse)
    @UseMiddleware(isAuth)
    async addComment(
        @Ctx() { payload }: MyContext,
        @Arg('content') content: string,
        @Arg('post_id') postId: string
    ): Promise<CommentResponse> {
        if (!content.length)
            return { errors: [{ message: 'ayooo thats an empty comment' }] }
        const post = await PostModel.findByIdAndPopulate(postId)
        if (!post)
            return {
                errors: [{ message: 'WHAT POST IS THAT?' }]
            }
        const comment = await CommentModel.create({
            content,
            author: payload.user._id
        })
        post.comments.push(comment)
        console.log(post, comment)
        ;(global as any).post = post
        ;(global as any).comment = comment
        await comment.save()
        await post.save()
        return {
            post: await PostModel.populateModel(post)
        }
    }

    @Mutation(() => CommentResponse)
    @UseMiddleware(isAuth)
    async deleteComment(
        @Ctx() { payload }: MyContext,
        @Arg('comment_id') commentId: string,
        @Arg('post_id') postId: string
    ): Promise<CommentResponse> {
        ;(global as any).payload = payload
        ;(global as any).commentId = commentId
        ;(global as any).postId = postId
        const post = await PostModel.findByIdAndPopulate(postId)
        if (!post) return { errors: [{ message: 'bruv that post dont exist' }] }
        ;(global as any).post = post
        const shit = (post.comments as CommentClass[]).find(
            (s: CommentClass) =>
                (s!.author as UserClass)._id.toString() === payload.user._id &&
                s._id.toString() === commentId
        )
        console.log(shit)
        if (!shit) {
            return {
                errors: [
                    {
                        message:
                            'ayo either this aint your comment or its the wrong post id or THE COMMENT IS ALREDY DELETED :O'
                    }
                ]
            }
        }
        await post.update({ $pull: { comments: commentId } })
        await post.save()
        const populated = await PostModel.populateModel(post!)
        console.log(populated)
        return {
            post: populated
        }
    }
    @Query(() => UserClass)
    @UseMiddleware(isAuth)
    postAuth(@Ctx() { payload }: MyContext) {
        console.log(payload)
        return payload?.user
    }
}
