import 'reflect-metadata'
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { TypegooseMiddleware } from './typegoose-middleware'
import { graphqlUploadExpress } from 'graphql-upload'
import path from 'path'

import resolvers from './resolvers'
import { PostModel, CommentModel, UserModel } from './models'
import { listen } from './socket'
import { socketAuth } from './socket/middleware/socketAuth'
import listeners from './socket/listeners'
const PORT = process.env.PORT || 8000
const main = async () => {
    const app = express()
    app.use(express.static(path.join('public')))
    app.use(graphqlUploadExpress({ maxFileSize: 8000000, maxFiles: 10 }))
    app.use(cors())
    mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/sma')
    const db = mongoose.connection
    db.on('error', err => console.error(err))
    db.on('open', () => console.log('CONNECTED :D'))
    ;(global as any).PostModel = PostModel
    ;(global as any).CommentModel = CommentModel
    ;(global as any).UserModel = UserModel
    ;(global as any).path = path
    const server = app.listen(PORT, () =>
        console.log(`listening on port ${PORT} url: http://localhost:${PORT}`)
    )
    const io = listen(server)
    io.use(socketAuth)
    listeners.forEach(s => s(io))
    const apollo = new ApolloServer({
        schema: await buildSchema({
            resolvers: Object.values(resolvers) as any,
            globalMiddlewares: [TypegooseMiddleware],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, io })
    })
    await apollo.start()
    apollo.applyMiddleware({ app })
}

main().catch(err => console.error(err))
