import mongoose, {Schema} from 'mongoose';
import {MongooseDataSource} from "../dist";
import {InMemoryLRUCache} from "apollo-server-caching";

interface CatInterface {
    name: string;
}

const Cat = mongoose.model<CatInterface>('Cat', new Schema<CatInterface>({
    name: { type: "String" }
}));

beforeAll((done) => {
    mongoose.connect(process.env.MONGO_URL!, (err) => {
        done(err);
    });
});

beforeEach((done) => {
    Cat.remove({}).then(() => {
        done();
    }).catch((err) => {
        done(err);
    })
});

afterAll(() => {
    mongoose.disconnect();
});

const runCommonTests = (dataSource: MongooseDataSource<CatInterface>) => {
    describe('findById', () => {
        test('Burek found', async () => {
            const dataSource = new MongooseDataSource<CatInterface>(Cat);

            const burek = new Cat({ name: 'Burek' });
            await burek.save();

            const result = await dataSource.findById(burek.id);

            expect(result).not.toBeNull();
            expect(result!.name).toBe('Burek');
        });

        test('Darek not found', async () => {
            const dataSource = new MongooseDataSource<CatInterface>(Cat);

            const burek = new Cat({ name: 'Burek' });
            await burek.save();

            const result = await dataSource.findById('507f1f77bcf86cd799439011');

            expect(result).toBeNull();
        });
    });

    describe('find', () => {
        test('by name Cezar', async () => {
            const burek = new Cat({ name: 'Burek' });
            await burek.save();

            const cezar = new Cat({ name: 'Cezar' });
            await cezar.save();

            let result = await dataSource.find({
                name: 'Cezar',
            });
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Cezar');

            result = await dataSource.find();
            expect(result.length).toBe(2);
        });

        test('with empty result', async () => {
            const burek = new Cat({ name: 'Burek' });
            await burek.save();

            const cezar = new Cat({ name: 'Cezar' });
            await cezar.save();

            let result = await dataSource.find({
                name: 'Darek',
            });
            expect(result.length).toBe(0);

        });

        test('with sort ASC', async () => {
            const burek = new Cat({ name: 'Burek' });
            await burek.save();

            const cezar = new Cat({ name: 'Cezar' });
            await cezar.save();

            let result = await dataSource.find({}, 1, 10, {
                name: 'asc',
            });
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Burek');
            expect(result[1].name).toBe('Cezar');
        });

        test('with sort DESC', async () => {
            const burek = new Cat({ name: 'Burek' });
            await burek.save();

            const cezar = new Cat({ name: 'Cezar' });
            await cezar.save();

            let result = await dataSource.find({}, 1, 10, {
                name: 'desc'
            });
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Cezar');
            expect(result[1].name).toBe('Burek');
        });

        test ('with limit 1', async () => {
            const burek = new Cat({ name: 'Burek' });
            await burek.save();

            const cezar = new Cat({ name: 'Cezar' });
            await cezar.save();

            let result = await dataSource.find({}, 1, 1, {
                name: 'desc'
            });
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Cezar');
        });

        test ('with skip 1', async () => {
            const burek = new Cat({ name: 'Burek' });
            await burek.save();

            const cezar = new Cat({ name: 'Cezar' });
            await cezar.save();

            let result = await dataSource.find({}, 2, 1, {
                name: 'desc'
            });
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Burek');
        });
    });
}

describe('MongooseDataSource', () => {
    describe('without cache', () => {
        const dataSource = new MongooseDataSource<CatInterface>(Cat);
        runCommonTests(dataSource);

        describe('making sure that i do not implement cache by default', () => {
            /**
             * Test should return cats in alphabetical order: Burek, Cezar, Panda so if we check 2nd cat without cache we should switch from Panda to Cezar
             */
            test('sort query without cache should modify results', async () => {
                const panda = new Cat({ name: 'Panda' });
                await panda.save();

                const cezar = new Cat({ name: 'Cezar' });
                await cezar.save();

                let result = await dataSource.find({}, 2, 1, {
                    name: 'asc'
                });
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Panda');

                const burek = new Cat({ name: 'Burek' });
                await burek.save();

                result = await dataSource.find({}, 2, 1, {
                    name: 'asc'
                });
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Cezar');
            });
        });
    });

    describe('with cache', () => {
        const dataSource = new MongooseDataSource<CatInterface>(Cat, {
            cache: new InMemoryLRUCache(),
            cacheOptions: {
                ttl: 5
            }
        });
        runCommonTests(dataSource);

        // Warning, this test is time sensitive and will fail if execution will be longer than 5s between saving panda and querying from cache again
        describe('cache hits', () => {
            test('sort query with 5s cache should not modify results', async () => {
                const panda = new Cat({ name: 'Panda' });
                await panda.save();

                const cezar = new Cat({ name: 'Cezar' });
                await cezar.save();

                let result = await dataSource.find({}, 2, 1, {
                    name: 'asc'
                });
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Panda');

                const burek = new Cat({ name: 'Burek' });
                await burek.save();

                result = await dataSource.find({}, 2, 1, {
                    name: 'asc'
                });
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Panda'); // We should still get panda because of cache
            });
        });
    });
});