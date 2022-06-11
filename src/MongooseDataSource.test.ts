const sum = (a: number, b: number) => {
    return a + b;
};

describe('MongooseDataSource', () => {
    test ('sum 2 and 3', () => {
        expect(sum(2, 3)).toBe(5);
    })
});