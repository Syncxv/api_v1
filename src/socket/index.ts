import { Server } from 'http'
import { Server as bruh } from 'socket.io'

export const listen = (server: Server) => {
    const io = new bruh(server, {
        cors: {
            // credentials: true,
            origin: [process.env.FRONT_END_DOMAIN || 'http://localhost:3000']
        }
    })
    return io
}
