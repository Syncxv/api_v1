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
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { saveImage } from '../utils/saveImage'

@InputType()
class CreatePostArgs {
    @Field()
    title: string
    @Field()
    content: string
    @Field(() => GraphQLUpload, { nullable: true })
    image?: FileUpload
    //ill do video later maybe if i feel like it
}

@ObjectType()
class DeletePostResponse {
    @Field(() => [GenericError], { nullable: true })
    errors?: GenericError[]
    @Field(() => PostClass, { nullable: true })
    post?: PostClass
}

@ObjectType()
class LikePostResponse {
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
@ObjectType()
class LikeCommentResponse {
    @Field(() => [GenericError], { nullable: true })
    errors?: GenericError[]
    @Field(() => CommentClass, { nullable: true })
    comment?: CommentClass
}

@Resolver(_ => PostModel)
export class postReslover {
    @Query(() => [PostClass])
    async getPosts(): Promise<PostClass[]> {
        return await PostModel.findAndPopulate()
    }
    @Query(() => PostClass, { nullable: true })
    async getPost(@Arg('post_id') postId: string): Promise<PostClass | null> {
        return await PostModel.findByIdAndPopulate(postId)
    }

    @Mutation(() => PostClass)
    @UseMiddleware(isAuth)
    async createPost(
        @Ctx() ctx: MyContext,
        @Arg('options') options: CreatePostArgs,
        @Arg('image', () => GraphQLUpload, { nullable: true })
        image?: FileUpload
    ): Promise<PostClass> {
        console.log(image)
        if (image) {
            const imageUrl = await saveImage(image, ctx)
            const post = await (
                await PostModel.create({
                    title: options.title,
                    content: options.content,
                    owner: ctx.payload.user._id,
                    attachment: imageUrl
                })
            ).save()
            return await PostModel.populateModel(post)
        }
        const post = await (
            await PostModel.create({
                title: options.title,
                content: options.content,
                owner: ctx.payload.user._id,
                image: null
            })
        ).save()
        return await PostModel.populateModel(post)
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

    @Mutation(() => LikePostResponse)
    @UseMiddleware(isAuth)
    async likePost(
        @Ctx() { payload: { user } }: MyContext,
        @Arg('post_id') postId: string
    ): Promise<LikePostResponse> {
        const post = await PostModel.findById(postId)
        if (!post) return { errors: [{ message: 'that post doesnt exist' }] }
        const isLiked = post.likedUsers.includes(user._id)
        if (isLiked) {
            const hehe = await PostModel.findByIdAndUpdate(
                postId,
                {
                    $pull: {
                        likedUsers: user._id
                    }
                },
                { new: true }
            )
            return {
                post: await PostModel.populateModel(hehe!)
            }
        }
        const hehe = await PostModel.findByIdAndUpdate(
            postId,
            {
                $push: { likedUsers: user._id }
            },
            { new: true }
        )
        return {
            post: await PostModel.populateModel(hehe!)
        }
    }
    @Mutation(() => CommentResponse)
    @UseMiddleware(isAuth)
    async addComment(
        @Ctx() ctx: MyContext,
        @Arg('content') content: string,
        @Arg('post_id') postId: string,
        @Arg('image', () => GraphQLUpload, { nullable: true })
        image?: FileUpload
    ): Promise<CommentResponse> {
        if (!content.length)
            return { errors: [{ message: 'ayooo thats an empty comment' }] }
        const post = await PostModel.findByIdAndPopulate(postId)
        if (!post)
            return {
                errors: [{ message: 'WHAT POST IS THAT?' }]
            }
        if (image) {
            const imageUrl = await saveImage(image, ctx)
            const comment = await CommentModel.create({
                content,
                attachment: imageUrl,
                author: ctx.payload.user._id
            })
            post.comments.push(comment)
            console.log(post, comment)
            await comment.save()
            await post.save()
        } else {
            const comment = await CommentModel.create({
                content,
                author: ctx.payload.user._id
            })
            post.comments.push(comment)
            console.log(post, comment)
            await comment.save()
            await post.save()
        }

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
    @Mutation(() => LikeCommentResponse)
    @UseMiddleware(isAuth)
    async likeComment(
        @Ctx() { payload: { user } }: MyContext,
        @Arg('comment_id') commentId: string
    ): Promise<LikeCommentResponse> {
        const comment = await CommentModel.findById(commentId)
        if (!comment)
            return { errors: [{ message: 'that comment doesnt exist' }] }
        const isLiked = comment.likedUsers.includes(user._id)
        if (isLiked) {
            const hehe = await CommentModel.findByIdAndUpdate(
                commentId,
                {
                    $pull: {
                        likedUsers: user._id
                    }
                },
                { new: true }
            )
            return {
                comment: await CommentModel.populateModel(hehe!)
            }
        }
        const hehe = await CommentModel.findByIdAndUpdate(
            commentId,
            {
                $push: { likedUsers: user._id }
            },
            { new: true }
        )
        return {
            comment: await CommentModel.populateModel(hehe!)
        }
    }
    @Query(() => UserClass)
    @UseMiddleware(isAuth)
    postAuth(@Ctx() { payload }: MyContext) {
        console.log(payload)
        return payload?.user
    }
}
