import { sign } from 'jsonwebtoken'
import { UserClass } from '../models/User'

export const createAcessToken = (user: UserClass) => {
    return sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '60m'
    })
}

export const createRefreshToken = (user: UserClass) => {
    return sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: '7d'
    })
}
