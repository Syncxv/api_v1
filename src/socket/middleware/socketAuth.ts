import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import jwt from 'jsonwebtoken'
export const socketAuth = (
    socket: Socket,
    next: (err?: ExtendedError | undefined) => void
) => {
    console.log('hey from socket auth middleware')
    if (socket.handshake.query && socket.handshake.query.token) {
        console.log(socket.handshake.query.token)
        try {
            const payload = jwt.verify(
                socket.handshake.query.token as string,
                process.env.ACCESS_TOKEN_SECRET!
            )
            socket.data.jwt = payload
            next()
        } catch (err) {
            console.error(err)
            return next(new Error('auth failed eh'))
        }
    } else {
        console.log('no auth eh')
        return next(new Error('bruh no auth eh'))
    }
}
