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

test('GET /api/auth/logout clears token cookie and returns 200 when authenticated', async () => {
  const plain = 'Secret123!';
  const hashed = await bcrypt.hash(plain, 10);

  const user = await User.create({
    username: 'logoutuser',
    email: 'logout@example.com',
    password: hashed,
    fullname: { firstName: 'Logout', lastName: 'User' }
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const cookie = `token=${token}; HttpOnly`;

  const res = await request(app)
    .get('/api/auth/logout')
    .set('Cookie', cookie)
    .expect(200);

  const cookies = res.headers['set-cookie'];
  expect(cookies).toBeDefined();
  // Expect cookie to attempt to clear the token (either empty value, Max-Age=0 or Expires set)
expect(cookies[0]).toMatch(/token=;/);
expect(cookies[0]).toMatch(/Expires=|Max-Age=0/);

});

test('GET /api/auth/logout is idempotent and returns 200 when no token provided', async () => {
  const res = await request(app)
    .get('/api/auth/logout')
    .expect(200);

  const cookies = res.headers['set-cookie'];
  expect(cookies[0]).toMatch(/token=;/);
expect(cookies[0]).toMatch(/Expires=|Max-Age=0/);

});

test('After logout the /api/auth/me endpoint is unauthorized', async () => {
  const plain = 'Secret123!';
  const hashed = await bcrypt.hash(plain, 10);

  const user = await User.create({
    username: 'logoutme',
    email: 'logoutme@example.com',
    password: hashed,
    fullname: { firstName: 'Logout', lastName: 'Me' }
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const cookie = `token=${token}; HttpOnly`;

  const logoutRes = await request(app)
    .get('/api/auth/logout')
    .set('Cookie', cookie)
    .expect(200);

  const cleared = logoutRes.headers['set-cookie'][0];

  // Use the cleared cookie value (client would replace old cookie)
  await request(app)
    .get('/api/auth/me')
    .set('Cookie', cleared)
    .expect(401);
});
 