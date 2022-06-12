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

Following previous example, you can take advantage of implemented cache. Right now I'm simply caching queries without tracking individual documents. There is a plan of using mongoose hooks to track changes in individual documents but I would be against that in distributed systems unless you implement global cache.

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
        return this.model.find({ name });
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