"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseDataSource = void 0;
const apollo_datasource_1 = require("apollo-datasource");
const mongoose_1 = __importDefault(require("mongoose"));
const apollo_server_errors_1 = require("apollo-server-errors");
class MongooseDataSource extends apollo_datasource_1.DataSource {
    constructor(model, options = {}) {
        super();
        this.options = {};
        if (typeof model !== 'function') {
            const type = typeof model;
            throw new apollo_server_errors_1.ApolloError(`You have to pass function as model in the constructor. ${type} passed.`);
        }
        if (model instanceof mongoose_1.default.Model) {
            throw new apollo_server_errors_1.ApolloError(`You have to pass mongoose model in the constructor.`);
        }
        this.model = model;
        this.options = options;
        this.keyValueCache = options.cache;
        this.keyValueCacheOptions = options.cacheOptions || {};
    }
    cache(query, options) {
        if (!this.keyValueCache) {
            return query.exec();
        }
        const key = JSON.stringify({
            model: query.model.modelName,
            populated: query.getPopulatedPaths().join(','),
            query: query._conditions,
            fields: query._fields,
            options: query.options,
        });
        return new Promise(async (resolve, reject) => {
            try {
                const cacheValue = await this.keyValueCache.get(key);
                if (cacheValue) {
                    resolve(cacheValue);
                }
                else {
                    const result = await query.exec();
                    await this.keyValueCache.set(key, result, options !== null && options !== void 0 ? options : this.keyValueCacheOptions);
                    resolve(result);
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    initialize(config) {
        this.context = config.context;
        this.keyValueCache = config.cache;
    }
    findById(objectId) {
        const find = this.model.findById(objectId);
        if (this.options.populate !== undefined) {
            find.populate(this.options.populate);
        }
        return this.cache(find);
    }
    find(filters = {}, page = 1, onPage = 10, sort = undefined) {
        if (!Number.isInteger(page)) {
            throw new apollo_server_errors_1.ApolloError('page parameter must be an integer');
        }
        if (!Number.isInteger(onPage)) {
            throw new apollo_server_errors_1.ApolloError('onPage parameter must be an integer');
        }
        if (onPage < 1) {
            throw new apollo_server_errors_1.ApolloError('onPage parameter must be a positive number');
        }
        if (onPage < 1) {
            throw new apollo_server_errors_1.ApolloError('page parameter must be a positive number');
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
exports.MongooseDataSource = MongooseDataSource;
//# sourceMappingURL=MongooseDataSource.js.map