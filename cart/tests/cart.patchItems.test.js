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

describe('PATCH /api/cart/items/:productId', () => {

    const userId = generateObjectId();
    const productId = generateObjectId();
    const otherProductId = generateObjectId();

    beforeEach(() => {
        CartModel.__reset();
    });

    test('updates quantity of existing item', async () => {
        const token = signToken({ id: userId, role: 'user' });

        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId, qty: 2 });

        const res = await request(app)
            .patch(`/api/cart/items/${productId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ qty: 5 });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Item updated');
        expect(res.body.cart.items[0].quantity).toBe(5);
    });

    test('404 when cart not found', async () => {
        const token = signToken({ id: userId, role: 'user' });

        const res = await request(app)
            .patch(`/api/cart/items/${productId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ qty: 3 });

        expect(res.status).toBe(404);
    });

    test('404 when item not found', async () => {
        const token = signToken({ id: userId, role: 'user' });

        await request(app)
            .post('/api/cart/items')
            .set('Authorization', `Bearer ${token}`)
            .send({ productId, qty: 1 });

        const res = await request(app)
            .patch(`/api/cart/items/${otherProductId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ qty: 4 });

        expect(res.status).toBe(404);
    });

});
