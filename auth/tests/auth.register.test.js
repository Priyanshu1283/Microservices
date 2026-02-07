const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const User = require('../src/modules/user.model');

let mongod;

process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';


beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Service – Register', () => {
  test('POST /api/auth/register creates user, hashes password and sets cookie', async () => {
    const payload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Secret123!',
      fullname: { firstName: 'Test', lastName: 'User' }
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload)
      .expect(201);

    // ✅ Response checks
    expect(res.body).toHaveProperty('message', 'User created');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', payload.email);
    expect(res.body.user).not.toHaveProperty('password');

    // ✅ Cookie check
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=/);
    expect(cookies[0]).toMatch(/HttpOnly/);

    // ✅ DB check
    const userInDb = await User.findOne({ email: payload.email }).select('+password');
    expect(userInDb).not.toBeNull();

    // ✅ Password hashing check
    const match = await bcrypt.compare(payload.password, userInDb.password);
    expect(match).toBe(true);
  });

  test('POST /api/auth/register prevents duplicate users', async () => {
    const payload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Secret123!',
      fullname: { firstName: 'Test', lastName: 'User' }
    };

    await request(app).post('/api/auth/register').send(payload).expect(201);

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload)
      .expect(409);

    expect(res.body).toHaveProperty(
      'message',
      'User with this email or username already exists'
    );
  });
});
