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

test('POST /api/auth/login authenticates existing user and sets cookie', async () => {
  const plain = 'Secret123!';
  const hashed = await bcrypt.hash(plain, 10);

  const existing = await User.create({
    username: 'loginuser',
    email: 'login@example.com',
    password: hashed,
    fullname: { firstName: 'Login', lastName: 'User' }
  });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: existing.email, password: plain })
    .expect(200);

  expect(res.body).toHaveProperty('message', 'Login successful');
  expect(res.body).toHaveProperty('user');
  expect(res.body.user).toHaveProperty('email', existing.email);
  expect(res.body.user).not.toHaveProperty('password');

  const cookies = res.headers['set-cookie'];
  expect(cookies).toBeDefined();
  expect(cookies[0]).toMatch(/token=/);
  expect(cookies[0]).toMatch(/HttpOnly/);
});
