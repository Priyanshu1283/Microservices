require('dotenv').config();
const app = require('./src/app');
const http = require('http');
const { initScoketServer } = require('./src/sockets/socket.server');

const httpServer = http.createServer(app);
initScoketServer(httpServer);

httpServer.listen(3005, () => {
  console.log('AI Buddy service is running on port 3005');
});