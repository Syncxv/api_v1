import { sign } from 'jsonwebtoken'
import { UserClass } from '../models/User'
import { MongoDocument } from '../types'

export const createAcessToken = (user: MongoDocument<UserClass>) => {
    return sign(
        { user: { ...user.toJSON(), password: undefined } },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: '10h'
        }
    )
}

export const createRefreshToken = (user: MongoDocument<UserClass>) => {
    return sign(
        { user: { ...user.toJSON(), password: undefined } },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: '7d'
        }
    )
}
