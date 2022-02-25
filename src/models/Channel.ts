import {
    prop,
    getModelForClass,
    Ref,
    ReturnModelType
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ObjectType } from 'type-graphql'
import { UserClass } from './User'

@ObjectType()
export class ChannelClass extends TimeStamps {
    @Field()
    readonly _id: string

    @prop({ required: true, ref: () => UserClass, default: [] })
    @Field(() => [UserClass])
    public members: Ref<UserClass>[]

    public static async findAndPopulate(
        this: ReturnModelType<typeof ChannelClass>,
        query?: any
    ) {
        return await this.find(query || {}).populate({
            path: 'members'
        })
    }
    public static async findOneAndPopulate(
        this: ReturnModelType<typeof ChannelClass>,
        query: any
    ) {
        return await this.findOne(query).populate({
            path: 'members'
        })
    }
}

export const ChannelModel = getModelForClass(ChannelClass, {
    schemaOptions: { timestamps: true }
})
