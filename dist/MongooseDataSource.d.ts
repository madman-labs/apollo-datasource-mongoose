import { DataSource } from "apollo-datasource";
import type { FilterQuery, ObjectId, QueryWithHelpers, SortOrder } from 'mongoose';
import { Model } from 'mongoose';
import type { KeyValueCache } from "apollo-server-caching";
import type { KeyValueCacheSetOptions } from "apollo-server-caching/src/KeyValueCache";
export interface MongooseDataSourceOptionsInterface<T> {
    populate?: string | string[];
    cache?: KeyValueCache<T | T[] | undefined>;
    cacheOptions?: KeyValueCacheSetOptions;
}
export declare class MongooseDataSource<T, ContextInterface = {}> extends DataSource<ContextInterface> {
    protected model: Model<T>;
    protected options: MongooseDataSourceOptionsInterface<T>;
    protected context?: ContextInterface;
    protected keyValueCache?: KeyValueCache<T | T[] | undefined>;
    protected keyValueCacheOptions: KeyValueCacheSetOptions;
    constructor(model: Model<T>, options?: MongooseDataSourceOptionsInterface<T>);
    protected cache(query: QueryWithHelpers<any, T>, options?: KeyValueCacheSetOptions): Promise<any>;
    initialize(config: {
        context: ContextInterface;
        cache: KeyValueCache<any>;
    }): void | Promise<void>;
    findById(objectId: ObjectId | string): Promise<T | null>;
    find(filters?: FilterQuery<T>, page?: number, onPage?: number, sort?: string | {
        [key: string]: SortOrder | {
            $meta: 'textScore';
        };
    } | undefined | null): Promise<T[]>;
}
//# sourceMappingURL=MongooseDataSource.d.ts.map