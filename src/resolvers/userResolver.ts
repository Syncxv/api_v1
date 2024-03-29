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
import { Feilds, MyContext } from '../types'
import { COOKIE_NAME, JWT_AGE } from '../constants'

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
class FollowRequestResponse {
    @Field(() => [GenericError], { nullable: true })
    errors?: GenericError[]
    @Field(() => UserClass, { nullable: true })
    user?: UserClass
}
@ObjectType()
export class FieldError {
    @Field()
    field: Feilds
    @Field()
    message: string
}

@ObjectType()
export class GenericError {
    @Field()
    message: string
}

@Resolver(_ => UserModel)
export class userReslover {
    @Query(() => [UserClass])
    async getUsers(): Promise<UserClass[]> {
        return await UserModel.find().populate({
            path: 'followers',
            select: ['username', 'id']
        })
    }
    @Query(() => UserClass, { nullable: true })
    async findUser(
        @Arg('username') username: string
    ): Promise<UserClass | null> {
        return await UserModel.findOne({ username }).populate({
            path: 'followers',
            select: ['username', 'id']
        })
    }
    @Mutation(() => UserAuthResponse)
    async userRegister(
        @Ctx() { res }: MyContext,
        @Arg('options') options: UserRegisterArgs
    ): Promise<UserAuthResponse> {
        const { username, email, password } = options
        if (username.length < 2) {
            return {
                errors: [
                    {
                        field: Feilds.USERNAME,
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
                        field: Feilds.USERNAME,
                        message: 'AYO USERNAME already taken dawg'
                    }
                ]
            }
        }
        const heheUserEnail = await UserModel.findOne({ email })
        if (heheUserEnail) {
            return {
                errors: [
                    {
                        field: Feilds.USERNAME,
                        message: 'AYO EMAIL already taken dawg'
                    }
                ]
            }
        }
        //TODO: like wtf is above me :| CLEAN THIS TRASH
        const hash = await argon.hash(password)
        const user = await UserModel.create({
            username,
            displayName: username,
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
                        field: Feilds.UNKOWN,
                        message: err.message
                    }
                ]
            }
        }
        console.log(user)
        const accessToken = createAcessToken(user)
        res.cookie(COOKIE_NAME, accessToken, {
            httpOnly: true,
            maxAge: JWT_AGE.int
        })
        return {
            user,
            accessToken
        }
    }
    @Mutation(() => UserAuthResponse)
    async userLogin(
        @Ctx() { res }: MyContext,
        @Arg('options') options: UserLoginArgs
    ) {
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
        const accessToken = createAcessToken(user)
        res.cookie(COOKIE_NAME, accessToken, {
            httpOnly: true,
            maxAge: JWT_AGE.int
        })
        return {
            user,
            accessToken
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

    @Mutation(() => FollowRequestResponse)
    @UseMiddleware(isAuth)
    async follow(
        @Ctx() { payload }: MyContext,
        @Arg('user_id') userId: string
    ): Promise<FollowRequestResponse> {
        const requestedUser = await UserModel.findById(userId)
        if (!requestedUser) {
            return {
                errors: [
                    {
                        message: 'WHO IS THAT BRUV'
                    }
                ]
            }
        }
        if (requestedUser?._id.toString() === payload.user._id) {
            return {
                errors: [
                    {
                        message: 'YOU THINK YOU CAN FOLLOW YOUR SELF?'
                    }
                ]
            }
        }
        if (
            requestedUser.followers.find(
                (s: any) => s._id.toString() === payload.user._id
            )
        )
            return {
                errors: [
                    {
                        message: 'bruv you cant follow twice'
                    }
                ]
            }
        requestedUser.followers.push(payload!.user._id)
        await requestedUser.save()
        return {
            user: await requestedUser.populate({
                path: 'followers',
                select: ['username', 'id']
            })
        }
    }
    @Mutation(() => FollowRequestResponse)
    @UseMiddleware(isAuth)
    async unfollow(
        @Ctx() { payload }: MyContext,
        @Arg('user_id') userId: string
    ): Promise<FollowRequestResponse> {
        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { followers: payload.user._id } },
            { new: true }
        ).populate({
            path: 'followers',
            select: ['username', 'id']
        })
        if (!user) {
            return { errors: [{ message: 'who is that eh' }] }
        }

        return {
            user: user
        }
    }
    @Query(() => UserClass)
    @UseMiddleware(isAuth)
    async me(@Ctx() { payload }: MyContext): Promise<UserClass> {
        const bruh = await UserModel.findByIdAndPopulate(payload.user._id)!
        return bruh!
    }
}
