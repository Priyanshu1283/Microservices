process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const User = require('../src/modules/user.model');

let mongoServer;

/* ------------------ Helpers ------------------ */

async function seedUserAndLogin({
  username = 'addr_user',
  email = 'addr@example.com',
  password = 'Secret123!',
} = {}) {
  const hash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password: hash,
    fullname: { firstName: 'Addr', lastName: 'User' },
    addresses: [],
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  expect(loginRes.status).toBe(200);
  const cookies = loginRes.headers['set-cookie'];
  expect(cookies).toBeDefined();

  return { cookies };
}

/* ------------------ Setup ------------------ */

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

/* ------------------ Tests ------------------ */

describe('User Addresses API', () => {

  /* ---------- GET addresses ---------- */
  describe('GET /api/auth/users/me/addresses', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/users/me/addresses');

      expect(res.status).toBe(401);
    });

    it('returns list of addresses with default marked', async () => {
      const { cookies } = await seedUserAndLogin({
        username: 'lister',
        email: 'lister@example.com',
      });

      const user = await User.findOne({ email: 'lister@example.com' });

      user.addresses.push(
        {
          street: '221B Baker St',
          city: 'London',
          state: 'LDN',
          pincode: 'NW16XE',
          country: 'UK',
          isDefault: true,
        },
        {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'SP',
          pincode: '49007',
          country: 'USA',
          isDefault: false,
        }
      );
      await user.save();

      const res = await request(app)
        .get('/api/auth/users/me/addresses')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.addresses)).toBe(true);
      expect(res.body.addresses.length).toBe(2);

      const defaultAddress = res.body.addresses.find(a => a.isDefault);
      expect(defaultAddress).toBeDefined();
    });
  });

  /* ---------- POST address ---------- */
  describe('POST /api/auth/users/me/addresses', () => {
    it('returns 400 for invalid pincode / phone', async () => {
      const { cookies } = await seedUserAndLogin({
        username: 'adder1',
        email: 'adder1@example.com',
      });

      const res = await request(app)
        .post('/api/auth/users/me/addresses')
        .set('Cookie', cookies)
        .send({
          street: 'Invalid St',
          city: 'Nowhere',
          state: 'NA',
          pincode: '12', // invalid
          country: 'US',
        });

      expect(res.status).toBe(400);
    });

    it('adds a new address and marks default if first', async () => {
      const { cookies } = await seedUserAndLogin({
        username: 'adder2',
        email: 'adder2@example.com',
      });

      const res = await request(app)
        .post('/api/auth/users/me/addresses')
        .set('Cookie', cookies)
        .send({
          street: '1600 Amphitheatre Pkwy',
          city: 'Mountain View',
          state: 'CA',
          pincode: '94043',
          country: 'US',
          phone: '9876543210',
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.address).toBeDefined();
      expect(res.body.address.street).toBe('1600 Amphitheatre Pkwy');
      expect(res.body.address.isDefault).toBe(true);
    });
  });

  /* ---------- DELETE address ---------- */
  describe('DELETE /api/auth/users/me/addresses/:addressId', () => {
    it('removes an address and updates list', async () => {
      const { cookies } = await seedUserAndLogin({
        username: 'deleter',
        email: 'deleter@example.com',
      });

      const user = await User.findOne({ email: 'deleter@example.com' });

      user.addresses.push(
        {
          street: 'A St',
          city: 'X',
          state: 'X',
          pincode: '11111',
          country: 'US',
        },
        {
          street: 'B St',
          city: 'Y',
          state: 'Y',
          pincode: '22222',
          country: 'US',
        }
      );
      await user.save();

      const addressId = user.addresses[0]._id.toString();

      const res = await request(app)
        .delete(`/api/auth/users/me/addresses/${addressId}`)
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.addresses)).toBe(true);

      const remaining = res.body.addresses.find(a => a._id === addressId);
      expect(remaining).toBeUndefined();
    });

    it('returns 404 if address does not exist', async () => {
      const { cookies } = await seedUserAndLogin({
        username: 'deleter2',
        email: 'deleter2@example.com',
      });

      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/auth/users/me/addresses/${fakeId}`)
        .set('Cookie', cookies);

      expect(res.status).toBe(404);
    });
  });

});
