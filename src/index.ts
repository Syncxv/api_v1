import 'reflect-metadata'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'

import { firstResolver } from './resolvers'
const PORT = 8000
const main = async () => {
    const app = express()
    const apollo = new ApolloServer({
        schema: await buildSchema({
            resolvers: [firstResolver],
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
