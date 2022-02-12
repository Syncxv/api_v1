import { sign } from 'jsonwebtoken'
import { UserClass } from '../models/User'

export const createAcessToken = (user: UserClass) => {
    return sign({ user }, process.env.ACCESS_TOKEN_SECRET!, {
        expiresIn: '10h'
    })
}

export const createRefreshToken = (user: UserClass) => {
    return sign({ user }, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: '7d'
    })
}
