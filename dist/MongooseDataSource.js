"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseDataSource = void 0;
const apollo_datasource_1 = require("apollo-datasource");
const mongoose_1 = require("mongoose");
const apollo_server_caching_1 = require("apollo-server-caching");
const apollo_server_errors_1 = require("apollo-server-errors");
class MongooseDataSource extends apollo_datasource_1.DataSource {
    constructor(model, options = {}) {
        super();
        this.options = {};
        if (false === (typeof model === 'object' && model.prototype instanceof mongoose_1.Model)) {
            throw new apollo_server_errors_1.ApolloError('You have to pass mongoose model in the constructor');
        }
        this.model = model;
        this.options = options;
        this.cache = new apollo_server_caching_1.InMemoryLRUCache();
    }
    initialize(config) {
        this.context = config.context;
        this.cache = config.cache || new apollo_server_caching_1.InMemoryLRUCache();
    }
    findById(objectId) {
        const find = this.model.findById(objectId);
        if (this.options.populate !== undefined) {
            find.populate(this.options.populate);
        }
        return find.exec();
    }
    find(filters, page = 1, onPage = 10, sort = undefined) {
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
        return this.model.find(filters).exec();
    }
}
exports.MongooseDataSource = MongooseDataSource;
//# sourceMappingURL=MongooseDataSource.js.map