const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = require('../src/app');
const User = require('../src/modules/user.model');

let mongod;

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
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

test('GET /api/auth/me returns current user when authenticated', async () => {
  const plain = 'Secret123!';
  const hashed = await bcrypt.hash(plain, 10);

  const user = await User.create({
    username: 'meuser',
    email: 'me@example.com',
    password: hashed,
    fullname: { firstName: 'Me', lastName: 'User' }
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const cookie = `token=${token}; HttpOnly`;

  const res = await request(app)
    .get('/api/auth/me')
    .set('Cookie', cookie)
    .expect(200);

  expect(res.body).toHaveProperty('user');
  expect(res.body.user).toHaveProperty('email', user.email);
  expect(res.body.user).not.toHaveProperty('password');
});

test('GET /api/auth/me returns 401 when no token provided', async () => {
  await request(app).get('/api/auth/me').expect(401);
});

test('GET /api/auth/me returns 401 for invalid token', async () => {
  const cookie = `token=invalid.token.value; HttpOnly`;
  await request(app).get('/api/auth/me').set('Cookie', cookie).expect(401);
});
