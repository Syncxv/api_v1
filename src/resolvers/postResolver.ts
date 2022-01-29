import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    Query,
    Resolver,
    UseMiddleware
} from 'type-graphql'

import { PostModel } from '../models'
import { isAuth } from '../jwt/isAuthMiddleware'
import { MyContext } from '../types'
import { PostClass } from '../models/Post'
import { UserClass } from '../models/User'

@InputType()
class CreatePostArgs {
    @Field()
    title: string
    @Field()
    content: string
}

@Resolver(_ => PostModel)
export class postReslover {
    @Query(() => [PostClass])
    async getPosts(): Promise<PostClass[]> {
        return await PostModel.find()
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

    @Query(() => UserClass)
    @UseMiddleware(isAuth)
    postAuth(@Ctx() { payload }: MyContext) {
        console.log(payload)
        return payload?.user
    }
}
