import 'reflect-metadata'
import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'

import resolvers from './resolvers'
import { TypegooseMiddleware } from './typegoose-middleware'
import { PostModel, CommentModel, UserModel } from './models'
import { graphqlUploadExpress } from 'graphql-upload'
import { corsOptions } from './types'
const PORT = process.env.PORT || 8000
const main = async () => {
    const app = express()
    app.use(graphqlUploadExpress({ maxFileSize: 10000, maxFiles: 10 }))
    app.use(cors(corsOptions))
    mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/sma')
    const db = mongoose.connection
    db.on('error', err => console.error(err))
    db.on('open', () => console.log('CONNECTED :D'))
    ;(global as any).PostModel = PostModel
    ;(global as any).CommentModel = CommentModel
    ;(global as any).UserModel = UserModel
    const apollo = new ApolloServer({
        schema: await buildSchema({
            resolvers: Object.values(resolvers) as any,
            globalMiddlewares: [TypegooseMiddleware],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res })
    })
    await apollo.start()
    apollo.applyMiddleware({ app })
    app.listen(PORT, () =>
        console.log(`listening on port ${PORT} url: http://localhost:${PORT}`)
    )
}

main().catch(err => console.error(err))
