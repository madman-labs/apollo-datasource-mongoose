import mongoose, {Schema} from 'mongoose';
import {MongooseDataSource} from "../dist";

interface CatInterface {
    name: string;
}

const Cat = mongoose.model<CatInterface>('Cat', new Schema<CatInterface>({
    name: { type: "String" }
}));

class CatDataSource extends MongooseDataSource<CatInterface> {
    findByName(name: string) {
        return this.find({ name });
    }
}

export const dataSources = () => {
    return {
        cats: new CatDataSource(Cat),
    };
};