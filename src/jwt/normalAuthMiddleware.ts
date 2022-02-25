import { verify } from 'jsonwebtoken'
import { MiddlewareFn } from 'type-graphql'
import { MyContext } from '../types'

export const isNormalAuth: MiddlewareFn<MyContext> = async (
    { context },
    next
) => {
    const auth = context.req.headers['authorization']
    if (auth) {
        try {
            const payload = verify(
                auth.split(' ')[1],
                process.env.ACCESS_TOKEN_SECRET!
            )
            context.payload = payload as any
        } catch (err) {
            console.log(err)
        }
    }
    return next()
}
