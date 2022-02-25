export const whitelist = [
    'http://localhost:3000',
    'https://studio.apollographql.com',
    process.env.FRONT_END_DOMAIN!
]
export const COOKIE_NAME = 'token'
export const corsOptions = {
    origin: function (origin: any, callback: any) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}
export const apiUrl = process.env.APIRUL || 'http://localhost:8000'
export const defaultLimit = 10
export const JWT_AGE = {
    string: '10h',
    int: 3.6e7
}
