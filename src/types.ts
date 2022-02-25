import {
    BeAnObject,
    IObjectWithTypegooseFunction
} from '@typegoose/typegoose/lib/types'
import { Document } from 'mongoose'
import { Request, Response } from 'express'
import { UserClass } from './models/User'
import { Server } from 'socket.io'

export type MyContext = {
    req: Request
    res: Response
    io: Server
    payload: { user: UserClass }
}

export enum Feilds {
    USERNAME = 'username',
    PASSWORD = 'password',
    EMAIL = 'email',
    UNKOWN = 'unkown'
}

export type MongoDocument<T> = Document<string, BeAnObject, any> &
    T &
    IObjectWithTypegooseFunction & {
        _id: string
    }
