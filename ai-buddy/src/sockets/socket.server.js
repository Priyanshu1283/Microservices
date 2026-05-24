const {Server} = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const {HumanMessage} = require("@langchain/core/messages");
const agent = require("../agent/agent");


async function initScoketServer(httpServer) {
  const io = new Server(httpServer, {}); 
 
  io.use((socket, next) => {
    const cookies = socket.handshake.headers?.cookie;
    const {token} = cookies ? cookie.parse(cookies) : {};

    if(!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        socket.token = token;

        next();
    } catch(err){
        next(new Error('Authentication error: Invalid token'));
    }

  });



    io.on('connection', (socket) => {
        console.log(socket.user, socket.token);

        console.log('A user connected');

        socket.on('message', async (data) => {
            console.log('Received message:', data);
            const agentResponse = await agent.invoke(
                {
                    messages: [
                        new HumanMessage(data)
                    ]
                },{
                    metadata: {
                        token: socket.token
                    }
                }
            )
            console.log('Agent response:', agentResponse);

            const lastMessage = agentResponse.messages[agentResponse.messages.length - 1];
            socket.emit('message', lastMessage.content);
        })
    });
}

module.exports = {
    initScoketServer
}