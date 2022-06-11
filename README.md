# apollo-datasource-mongoose

Apollo datasource for mongoose

## Installation

```
npm install apollo-datasource-mongoose
```

## Usage

```
import mongoose from 'mongoose';
import {MongooseDataSource} from 'apollo-datasource-mongoose'

const Cat = mongoose.model('Cat', { name: String });

const dataSources = () => {
    return {
        cats: new MongooseDataSource(Cat);
    };
};
```