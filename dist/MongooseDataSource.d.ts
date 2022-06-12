import { DataSource, DataSourceConfig } from "apollo-datasource";
import type { FilterQuery, ObjectId, SortOrder } from 'mongoose';
import { Model } from 'mongoose';
import type { KeyValueCache } from "apollo-server-caching";
import type { KeyValueCacheSetOptions } from "apollo-server-caching/src/KeyValueCache";
export interface MongooseDataSourceOptionsInterface {
    populate?: string | string[];
    cache?: KeyValueCache;
    cacheOptions?: KeyValueCacheSetOptions;
}
export declare class MongooseDataSource<T, ContextInterface = {}> extends DataSource<ContextInterface> {
    protected model: Model<T>;
    protected options: MongooseDataSourceOptionsInterface;
    protected context?: ContextInterface;
    protected keyValueCache?: KeyValueCache;
    protected keyValueCacheOptions: KeyValueCacheSetOptions;
    constructor(model: Model<T>, options?: MongooseDataSourceOptionsInterface);
    private cache;
    initialize(config: DataSourceConfig<ContextInterface>): void | Promise<void>;
    findById(objectId: ObjectId | string): Promise<T | null>;
    find(filters?: FilterQuery<T>, page?: number, onPage?: number, sort?: string | {
        [key: string]: SortOrder | {
            $meta: 'textScore';
        };
    } | undefined | null): Promise<T[]>;
}
//# sourceMappingURL=MongooseDataSource.d.ts.map