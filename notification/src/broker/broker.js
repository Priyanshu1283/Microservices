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

module.exports = {
    connect,
    channel,
    connection
}