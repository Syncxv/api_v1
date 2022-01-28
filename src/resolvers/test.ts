import { Query, Resolver } from 'type-graphql'

@Resolver()
export class firstResolver {
    @Query(() => String)
    nice() {
        return 'WOAH'
    }
}
