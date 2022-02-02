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
