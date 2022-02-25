import { Server } from 'socket.io'

const mainListner = (io: Server) => {
    io.on('connection', socket => {
        console.log('WOAH: ', socket.data.jwt)
    })
}

export default mainListner
