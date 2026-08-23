const amqplib = require("amqplib");

let channel;
let connection;

async function connect() {

    if (connection && channel) {
        return;
    }

    try {

        connection = await amqplib.connect(process.env.RABBIT_URL);

        console.log("Connected to RabbitMQ");

        channel = await connection.createChannel();

        channel.on("error", (error) => {
            console.error(
                "RabbitMQ channel error:",
                error.message
            );
        });

        connection.on("error", (error) => {
            console.error(
                "RabbitMQ connection error:",
                error.message
            );
        });

        connection.on("close", () => {
            console.log("RabbitMQ connection closed");

            connection = null;
            channel = null;
        });

    } catch (error) {

        console.error(
            "Failed to connect to RabbitMQ:",
            error.message
        );

        throw error;
    }
}


async function publishToQueue(queueName, data = {}) {

    if (!channel || !connection) {
        await connect();
    }

    await channel.assertQueue(queueName, {
        durable: true
    });

    channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(data)),
        {
            persistent: true
        }
    );
}


async function subscribeToQueue(queueName, callback) {

    if (!channel || !connection) {
        await connect();
    }

    await channel.assertQueue(queueName, {
        durable: true
    });

    await channel.consume(queueName, async (msg) => {

        if (!msg) return;

        try {

            const data = JSON.parse(
                msg.content.toString()
            );

            console.log(
                `Received message from ${queueName}`
            );

            // Process notification
            await callback(data);

            // ACK only after successful processing
            channel.ack(msg);

        } catch (error) {

            console.error(
                "Error processing message:",
                error.message
            );

            // Retry message
            channel.nack(msg, false, true);
        }
    });
}


module.exports = {
    connect,
    publishToQueue,
    subscribeToQueue,
};