import { FileUpload } from 'graphql-upload'

import path from 'node:path'
import fs from 'node:fs'
import { MyContext } from '../types'
import { apiUrl } from '../constants'

export const saveImage = async (
    { filename, createReadStream }: FileUpload,
    { payload: { user } }: MyContext
): Promise<string | null> => {
    try {
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
        const realFileName = `${name}-${new Date().getTime()}${ext}`
        const pathName = path.join(
            __dirname,
            '..',
            '..',
            'public',
            'images',
            user._id,
            realFileName
        )
        await createReadStream().pipe(fs.createWriteStream(pathName))
        return `${apiUrl}/images/${user._id}/${realFileName}`
    } catch (err) {
        console.error(err)
        return null
    }
}
