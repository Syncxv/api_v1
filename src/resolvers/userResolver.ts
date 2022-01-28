import { Query, Resolver } from 'type-graphql'
import { UserModel } from '../models'
import { UserClass } from '../models/User'

@Resolver(of => UserModel)
export class userReslover {
    @Query(() => [UserClass])
    async getUsers(): Promise<UserClass[]> {
        return await UserModel.find()
    }
}
