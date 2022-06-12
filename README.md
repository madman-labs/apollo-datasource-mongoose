# apollo-datasource-mongoose

![CI](https://github.com/madman-labs/apollo-datasource-mongoose/actions/workflows/ci.yml/badge.svg?branch=main)

---

> :warning: **I just started this project.** It's still in early developmen phase

## TODO

- [x] .find() and .findById() with basic parameters
- [x] auto population of the fields
- [x] Basic tests using active mongodb
- [ ] Mocking mongodb in tests so I can drop dependency on mongodb database
- [ ] Tests on a live projects to look for any issues
- [x] Cache implementation
- [ ] Implement mongoose hooks to track cached items

## Installation

```
npm install @dariuszp/apollo-datasource-mongoose
```

## Usage

```
import mongoose, {Schema} from 'mongoose';
import {MongooseDataSource} from '@dariuszp/apollo-datasource-mongoose';

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
```

Creating your own data source using inheritance:

```
import mongoose, {Schema} from 'mongoose';
import {MongooseDataSource} from '@dariuszp/apollo-datasource-mongoose';

interface CatInterface {
    name: string;
}

const Cat = mongoose.model<CatInterface>('Cat', new Schema<CatInterface>({
    name: { type: "String" }
}));

class CatDataSource extends MongooseDataSource<CatInterface> {
    findByName(name: string) {
        return this.model.find({ name });
    }
}

export const dataSources = () => {
    return {
        cats: new CatDataSource(Cat),
    };
};
```

## Cache

Following previous example, you can take advantage of implemented cache. 
Right now I'm simply caching queries without tracking individual documents.
There is a plan to track individual documents using and updating them in cache in the future.

You can take advantage of **this.cache()** method. Pass mongoose query to it and data source will try to create a cache for it.

You can also use cache directly by calling **this.keyValueCache**

```
import mongoose, {Schema} from 'mongoose';
import {MongooseDataSource} from '@dariuszp/apollo-datasource-mongoose';
import {InMemoryLRUCache} from "apollo-server-caching";

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
        cats: new CatDataSource(Cat, {
            cache: new InMemoryLRUCache(),
            cacheOptions: {
                ttl: 5 // Cache queries for 5s
            }
        }),
    };
};
```