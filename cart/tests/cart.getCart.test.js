process.env.JWT_SECRET = "testsecret";

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/models/cart.model.js', () => {
    function mockGenerateObjectId() {
        return Array.from({ length: 24 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }

    const carts = new Map();

    class CartMock {
        constructor({ user, items }) {
            this._id = mockGenerateObjectId();
            this.user = user;
            this.items = items || [];
        }

        static async findOne(query) {
            return carts.get(query.user) || null;
        }

        async save() {
            carts.set(this.user, this);
            return this;
        }
    }

    CartMock.__reset = () => carts.clear();

    return CartMock;
});

const app = require('../src/app');
const CartModel = require('../src/models/cart.model.js');

function generateObjectId() {
    return Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}

function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('GET /api/cart', () => {

    const userId = generateObjectId();
    const productA = generateObjectId();
    const productB = generateObjectId();

    beforeEach(() => {
        CartModel.__reset();
    });

    test('returns cart with totals', async () => {
        const token = signToken({ id: userId, role: 'user' });

        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: productA, qty: 2 });

        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId: productB, qty: 3 });

        const res = await request(app)
            .get('/api/cart')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.cart.items).toHaveLength(2);
        expect(res.body.totals).toMatchObject({
            itemCount: 2,
            totalQuantity: 5
        });
    });

});
