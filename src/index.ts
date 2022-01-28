import 'reflect-metadata'
import express from 'express'
import mongoose from 'mongoose'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'

import { firstResolver, userReslover } from './resolvers'

const PORT = process.env.PORT || 8000
const main = async () => {
    const app = express()
    mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/sma')
    const db = mongoose.connection
    db.on('error', err => console.error(err))
    db.on('open', () => console.log('CONNECTED :D'))
    const apollo = new ApolloServer({
        schema: await buildSchema({
            resolvers: [firstResolver, userReslover],
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