import { Arg, Mutation, Resolver } from 'type-graphql'
import { FileUpload, GraphQLUpload, Upload } from 'graphql-upload'

@Resolver()
export class imageResolver {
    @Mutation(() => Boolean)
    async uploadImage(@Arg('file', () => GraphQLUpload) file: FileUpload) {
        console.log(file)
        return true
    }
}
