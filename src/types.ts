import { Request, Response } from 'express'
import { UserClass } from './models/User'

export type MyContext = {
    req: Request
    res: Response
    payload: { user: UserClass }
}

export enum Feilds {
    USERNAME = 'username',
    PASSWORD = 'password',
    EMAIL = 'email',
    UNKOWN = 'unkown'
}

export const whitelist = [
    'http://localhost:3000',
    'https://studio.apollographql.com',
    '*'
]
export const corsOptions = {
    origin: function (origin: any, callback: any) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}
