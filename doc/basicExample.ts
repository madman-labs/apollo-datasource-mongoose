import mongoose, {Schema} from 'mongoose';
import {MongooseDataSource} from "../dist";

interface CatInterface {
    name: string;
}

const Cat = mongoose.model<CatInterface>('Cat', new Schema<CatInterface>({
    name: { type: "String" }
}));

export const dataSources = () => {
    return {
        cats: new MongooseDataSource<CatInterface>(Cat),
    };
};