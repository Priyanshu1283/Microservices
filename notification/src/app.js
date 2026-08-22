const express = require("express");
const {
    connect,
    subscribeToQueue
} = require("./broker/broker");

const {
    sendWelcomeEmail
} = require("./services/notification.service");

const {
    verifyEmailConnection
} = require("./email");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "Notification Service is up and running"
    });
});

async function startNotificationService() {
    try {

        await connect();

        await verifyEmailConnection();

        await subscribeToQueue(
            "AUTH_NOTIFICATION_USER_CREATED",
            sendWelcomeEmail
        );

        console.log("Notification consumer started");

    } catch (error) {

        console.error(
            "Notification service startup failed:",
            error.message
        );

        process.exit(1);
    }
}

startNotificationService();

module.exports = app;