import { Field, InputType, Mutation, Query, Resolver } from 'type-graphql'
import { UserModel } from '../models'
import { UserClass } from '../models/User'
import { Arg } from 'type-graphql'

@InputType()
class UserCreateTempArgs {
    @Field()
    username: string
    @Field()
    password: string
    @Field()
    email: string
    @Field({ nullable: true })
    avatar?: string
}

@Resolver(_ => UserModel)
export class userReslover {
    @Query(() => [UserClass])
    async getUsers(): Promise<UserClass[]> {
        return await UserModel.find()
    }
    @Mutation(() => UserClass)
    async createUserTemp(
        @Arg('options') options: UserCreateTempArgs
    ): Promise<UserClass> {
        const { username, email, password, avatar } = options
        const user = await UserModel.create({
            username,
            email,
            password,
            avatar
        })
        console.log(user)
        return user
    }
    @Mutation(() => Boolean)
    async removeUserTemp(@Arg('id') id: string): Promise<boolean> {
        const user = await UserModel.findById(id)
        if (user) {
            await user.delete()
            return true
        }
        return false
    }
}
