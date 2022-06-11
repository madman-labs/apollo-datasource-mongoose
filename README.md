# apollo-datasource-mongoose

Apollo datasource for mongoose

## Usage

```
import mongoose from 'mongoose';
import {MongooseDataSource} from 'apollo-datasource-mongoose'

mongoose.connect('mongodb://localhost:27017/test');

const Cat = mongoose.model('Cat', { name: String });

const typeDefs = gql`
    type Cat {
        id: ID!
        name: String!
    }
`;

const dataSources = () => {
    return {
        cats: new MongooseDataSource(Cat),
    };
};
```