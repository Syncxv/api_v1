import { verify } from 'jsonwebtoken'
import { MiddlewareFn } from 'type-graphql'
import { MyContext } from '../types'

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
    const auth = context.req.headers['authorization']
    if (!auth) {
        throw new Error('no authorization token')
    }
    try {
        const payload = verify(auth, process.env.ACCESS_TOKEN_SECRET!)
        context.payload = payload as any
    } catch (err) {
        console.log(err)
        throw new Error('didnt work :|')
    }
    return next()
}
