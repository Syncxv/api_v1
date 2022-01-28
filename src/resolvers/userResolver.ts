import {
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware
} from 'type-graphql'
import { UserModel } from '../models'
import { UserClass } from '../models/User'
import { Arg } from 'type-graphql'
import argon from 'argon2'
import { createAcessToken } from '../jwt'
import { isAuth } from '../jwt/isAuthMiddleware'
import { MyContext } from '../types'

@InputType()
class UserRegisterArgs {
    @Field()
    username: string
    @Field()
    password: string
    @Field()
    email: string
    @Field({ nullable: true })
    avatar?: string
}

@InputType()
class UserLoginArgs {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class UserAuthResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
    @Field(() => UserClass, { nullable: true })
    user?: UserClass
    @Field(() => String, { nullable: true })
    accessToken?: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string
    @Field()
    message: string
}

@Resolver(_ => UserModel)
export class userReslover {
    @Query(() => [UserClass])
    async getUsers(): Promise<UserClass[]> {
        return await UserModel.find()
    }
    @Mutation(() => UserAuthResponse)
    async userRegister(
        @Arg('options') options: UserRegisterArgs
    ): Promise<UserAuthResponse> {
        const { username, email, password } = options
        if (username.length < 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message:
                            'AYO make it longer than that. At least 3 characters'
                    }
                ]
            }
        }
        const heheUser = await UserModel.findOne({ username })
        if (heheUser) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'AYO USERNAME already taken dawg'
                    }
                ]
            }
        }
        const hash = await argon.hash(password)
        const user = await UserModel.create({
            username,
            email,
            password: hash
        })
        try {
            await user.save()
        } catch (err) {
            console.error(err)
            return {
                errors: [
                    {
                        field: 'unkown',
                        message: err.message
                    }
                ]
            }
        }
        console.log(user)
        return {
            user,
            accessToken: createAcessToken(user)
        }
    }
    @Mutation(() => UserAuthResponse)
    async userLogin(@Arg('options') options: UserLoginArgs) {
        const user = await UserModel.findOne({
            username: options.username
        }).select('+password')
        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'bruv that account doesnt exist'
                    }
                ]
            }
        }
        console.log(user)
        const valid = await argon.verify(user.password, options.password)
        if (!valid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'PASSWORD is wrong bruv :|'
                    }
                ]
            }
        }
        return {
            user,
            accessToken: createAcessToken(user)
        }
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

    @Query(() => String)
    @UseMiddleware(isAuth)
    test(@Ctx() { payload }: MyContext) {
        console.log(payload)
        return `${payload?.userId}`
    }
}
