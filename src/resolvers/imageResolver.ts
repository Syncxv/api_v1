import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import path from 'path'
import fs from 'fs'
import { isAuth } from '../jwt/isAuthMiddleware'
import { MyContext } from '../types'
@Resolver()
export class imageResolver {
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async uploadImage(
        @Ctx() { payload: { user } }: MyContext,
        @Arg('file', () => GraphQLUpload)
        { createReadStream, filename }: FileUpload
    ) {
        const userDir = path.join(
            __dirname,
            '..',
            '..',
            'public',
            'images',
            user._id
        )
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir)
        }
        const { ext, name } = path.parse(filename)
        const pathName = path.join(
            __dirname,
            '..',
            '..',
            'public',
            'images',
            user._id,
            `${name}-${new Date().getTime()}${ext}`
        )
        await createReadStream().pipe(fs.createWriteStream(pathName))
        return true
    }
}
