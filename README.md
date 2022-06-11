# apollo-datasource-mongoose

---

![CI](https://github.com/madman-labs/apollo-datasource-mongoose/actions/workflows/ci.yml/badge.svg?branch=main)

---

> :warning: **I just started this project.** It's still in early developmen phase

## TODO

- [x] .find() and .findById() with basic parameters
- [x] auto population of the fields
- [x] Basic tests using active mongodb
- [ ] Mocking mongodb in tests so I can drop dependency on mongodb database
- [ ] Tests on a live projects to look for any issues
- [ ] Cache implementation (right now nothing is cached)

## Installation

```
npm install apollo-datasource-mongoose
```

## Usage

```
import mongoose, {Schema} from 'mongoose';
import {MongooseDataSource} from 'apollo-datasource-mongoose';

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
import {MongooseDataSource} from 'apollo-datasource-mongoose';

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