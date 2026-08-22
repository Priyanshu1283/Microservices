const amqplib = require('amqplib')

let channel, connection

async function connect() {

    if (connection) return connection;

    try {
        connection = await amqplib.connect(process.env.RABBIT_URL);
        console.log('Connected to RabbitMQ');
        channel = await connection.createChannel();
        // await channel.assertQueue('emailQueue', {durable: true});
        // return connection;
    } catch (err) {
        console.log('Failed to connect to RabbitMQ', err);
    }
}

async function publishToQueue(queueName, data = {}) {
    if (!channel || !connection) await connect();

    // assertQueue() -> Ensure queue exists
    // durable: true -> ensures that the queue will survive a server restart
    await channel.assertQueue(queueName, {
        durable: true
    })
    //Rabbit Amqp data ko buffer ke form me transfer kerta hai...
    // Buffer.from() -> converts the JSON data into a buffer (raw binary data) before sending it to the queue
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    console.log('message send to queue broker', queueName, data);
}

async function subscribeToQueue(queueName, callback) {
    if (!channel || !connection) await connect();

    await channel.assertQueue(queueName, {
        durable: true
    })

    channel.consume(queueName, async (msg) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            await callback(data);
            channel.ack(msg);
        }
    })
}

module.exports = {
    connect,
    channel,
    connection,
    publishToQueue,
    subscribeToQueue
}