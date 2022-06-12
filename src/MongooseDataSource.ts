import {DataSource} from "apollo-datasource";
import type {FilterQuery, ObjectId, QueryWithHelpers, SortOrder} from 'mongoose';
import mongoose, {Model} from 'mongoose';
import type {KeyValueCache} from "apollo-server-caching";
import {ApolloError} from "apollo-server-errors";
import type {KeyValueCacheSetOptions} from "apollo-server-caching/src/KeyValueCache";

export interface MongooseDataSourceOptionsInterface<T> {
    populate?: string | string[];
    cache?: KeyValueCache<T | T[] | undefined>
    cacheOptions?: KeyValueCacheSetOptions
}

export class MongooseDataSource<T, ContextInterface = {}> extends DataSource<ContextInterface> {

    protected model: Model<T>;

    protected options: MongooseDataSourceOptionsInterface<T> = {};

    protected context?: ContextInterface;

    protected keyValueCache?: KeyValueCache<T | T[] | undefined>;
    protected keyValueCacheOptions;

    constructor(model: Model<T>, options: MongooseDataSourceOptionsInterface<T> = {}) {
        super();

        if (typeof model !== 'function') {
            const type = typeof model;
            throw new ApolloError(`You have to pass function as model in the constructor. ${type} passed.`);
        }

        if (model instanceof mongoose.Model) {
            throw new ApolloError(`You have to pass mongoose model in the constructor.`);
        }

        this.model = model;
        this.options = options;
        this.keyValueCache = options.cache;
        this.keyValueCacheOptions = options.cacheOptions || {};
    }

    protected cache(query: QueryWithHelpers<any, T>, options?: KeyValueCacheSetOptions): Promise<any> {
        if (!this.keyValueCache) {
            return query.exec();
        }

        const key = JSON.stringify({
            model: query.model.modelName,
            populated: query.getPopulatedPaths().join(','), // undocumented
            query: (query as any)._conditions, // undocumented
            fields: (query as any)._fields, // undocumented
            options: (query as any).options, // undocumented
        });

        return new Promise(async (resolve, reject) => {
            try {
                const cacheValue = await this.keyValueCache!.get(key);
                if (cacheValue) {
                    resolve(cacheValue);
                } else {
                    const result = await query.exec();
                    await this.keyValueCache!.set(key, result, options ?? this.keyValueCacheOptions);
                    resolve(result);
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    override initialize(config: { context: ContextInterface; cache: KeyValueCache<any>; }): void | Promise<void> {
        this.context = config.context;
        this.keyValueCache = config.cache as KeyValueCache<T | T[] | undefined>;
    }

    findById(objectId: ObjectId | string): Promise<T | null> {
        const find = this.model.findById(objectId);
        if (this.options.populate !== undefined) {
            find.populate(this.options.populate);
        }
        return this.cache(find);
    }

    find(filters: FilterQuery<T> = {}, page: number = 1, onPage: number = 10, sort: string | { [key: string]: SortOrder | { $meta: 'textScore' } } | undefined | null = undefined): Promise<T[]> {
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

        return this.cache(find);
    }
}