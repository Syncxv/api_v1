import { Ctx, Query, Resolver, UseMiddleware } from 'type-graphql'

import { PostModel } from '../models'
import { isAuth } from '../jwt/isAuthMiddleware'
import { MyContext } from '../types'
import { PostClass } from '../models/Post'
import { UserClass } from '../models/User'

@Resolver(_ => PostModel)
export class postReslover {
    @Query(() => [PostClass])
    async getUsers(): Promise<PostClass[]> {
        return await PostModel.find()
    }

    @Query(() => UserClass)
    @UseMiddleware(isAuth)
    postAuth(@Ctx() { payload }: MyContext) {
        console.log(payload)
        return payload?.user
    }
}
