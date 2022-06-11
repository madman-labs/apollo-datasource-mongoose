import {DataSource, DataSourceConfig} from "apollo-datasource";
import type {Document, FilterQuery, ObjectId, SortOrder, Types} from 'mongoose';
import {Model} from 'mongoose';
import type {KeyValueCache} from "apollo-server-caching";
import {InMemoryLRUCache} from "apollo-server-caching";
import {ApolloError} from "apollo-server-errors";

export interface MongooseDataSourceOptionsInterface {
    populate?: string | string[];
}

export class MongooseDataSource<T, ContextInterface = {}> extends DataSource<ContextInterface> {

    protected model: Model<T & Document<Types.ObjectId>>;

    protected options: MongooseDataSourceOptionsInterface = {};

    protected context?: ContextInterface;

    protected cache: KeyValueCache;

    constructor(model: Model<T & Document<Types.ObjectId>>, options: MongooseDataSourceOptionsInterface = {}) {
        super();

        if (false === (typeof model === 'object' && (model as Model<any>).prototype instanceof Model)) {
            throw new ApolloError('You have to pass mongoose model in the constructor');
        }

        this.model = model;
        this.options = options;
        this.cache = new InMemoryLRUCache();
    }

    override initialize(config: DataSourceConfig<ContextInterface>): void | Promise<void> {
        this.context = config.context;
        this.cache = config.cache || new InMemoryLRUCache()
    }

    findById(objectId: ObjectId | string): Promise<T & Document<Types.ObjectId> | null> {
        const find = this.model.findById(objectId);
        if (this.options.populate !== undefined) {
            find.populate(this.options.populate);
        }
        return find.exec();
    }

    find(filters: FilterQuery<T>, page: number = 1, onPage: number = 10, sort: string | { [key: string]: SortOrder | { $meta: 'textScore' } } | undefined | null = undefined): Promise<Array<T & Document<Types.ObjectId>>> {
        if (!Number.isInteger(page)) {
            throw new ApolloError('page parameter must be an integer');
        }

        if (!Number.isInteger(onPage)) {
            throw new ApolloError('onPage parameter must be an integer');
        }

        if (onPage < 1) {
            throw new ApolloError('onPage parameter must be a positive number');
        }

        if (onPage < 1) {
            throw new ApolloError('page parameter must be a positive number');
        }

        const find = this.model.find(filters);
        if (sort !== undefined && sort !== null) {
            find.sort(sort);
        }

        find.limit(onPage);
        find.skip((page - 1) * onPage);

        if (this.options.populate !== undefined) {
            find.populate(this.options.populate);
        }

        return this.model.find(filters).exec();
    }
}