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

export const apiUrl = process.env.APIRUL || 'http://localhost:8000'
export const defaultLimit = 10
