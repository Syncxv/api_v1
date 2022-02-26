import { Server } from 'socket.io'
import { UserClass } from '../../models/User'

export const usersMap = new Map<string, UserClass & { socketId: string }>()

const mainListner = (io: Server) => {
    io.on('connection', socket => {
        console.log('WOAH: ', socket.data.jwt)
        usersMap.set(socket.data.jwt.user._id, {
            ...socket.data.jwt.user,
            socketId: socket.id
        })
    })
}

export default mainListner
