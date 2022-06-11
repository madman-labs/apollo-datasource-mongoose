import mongoose, {Schema} from 'mongoose';
import {MongooseDataSource} from "../dist";

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

describe('MongooseDataSource', () => {
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
            const dataSource = new MongooseDataSource<CatInterface>(Cat);

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
            const dataSource = new MongooseDataSource<CatInterface>(Cat);

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
            const dataSource = new MongooseDataSource<CatInterface>(Cat);

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
            const dataSource = new MongooseDataSource<CatInterface>(Cat);

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
            const dataSource = new MongooseDataSource<CatInterface>(Cat);

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
            const dataSource = new MongooseDataSource<CatInterface>(Cat);

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
});