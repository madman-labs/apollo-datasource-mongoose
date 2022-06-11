import { DataSource, DataSourceConfig } from "apollo-datasource";
import type { Document, FilterQuery, ObjectId, SortOrder, Types } from 'mongoose';
import { Model } from 'mongoose';
import type { KeyValueCache } from "apollo-server-caching";
export interface MongooseDataSourceOptionsInterface {
    populate?: string | string[];
}
export declare class MongooseDataSource<T, ContextInterface = {}> extends DataSource<ContextInterface> {
    protected model: Model<T & Document<Types.ObjectId>>;
    protected options: MongooseDataSourceOptionsInterface;
    protected context?: ContextInterface;
    protected cache: KeyValueCache;
    constructor(model: Model<T & Document<Types.ObjectId>>, options?: MongooseDataSourceOptionsInterface);
    initialize(config: DataSourceConfig<ContextInterface>): void | Promise<void>;
    findById(objectId: ObjectId | string): Promise<T & Document<Types.ObjectId> | null>;
    find(filters: FilterQuery<T>, page?: number, onPage?: number, sort?: string | {
        [key: string]: SortOrder | {
            $meta: 'textScore';
        };
    } | undefined | null): Promise<Array<T & Document<Types.ObjectId>>>;
}
//# sourceMappingURL=MongooseDataSource.d.ts.map