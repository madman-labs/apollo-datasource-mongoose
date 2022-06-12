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

    findCatsStartingWithLetterC() {
        const query = this.model.find({
            name: {
                $regex: /^c.*/i
            }
        });
        // Using simply build-in cache method that cache using query
        return this.cache(query);
    }

    findByIdWithCustomCache(id: string): Promise<CatInterface | null> {
        return new Promise<CatInterface | null>(async (resolve, reject) => {
            try {
                // Querying cache using document id
                const cached = await this.keyValueCache!.get(id) as CatInterface | undefined;
                if (cached) {
                    resolve(cached);
                } else {
                    const item = await this.model.findById(id);
                    if (!item) {
                        resolve(null);
                    } else {
                        // Saving in cache object using document id
                        await this.keyValueCache!.set(item.id, item.toObject());
                        resolve(item.toObject());
                    }
                }
            } catch (e) {
                reject(e);
            }
        });
    }
}

export const dataSources = () => {
    return {
        cats: new CatDataSource(Cat),
    };
};