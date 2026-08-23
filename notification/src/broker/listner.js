const { connect, subscribeToQueue } = require("./broker");
const { sendWelcomeEmail, sendPaymentEmail, sendPaymentFailedEmail} = require("../services/notification.service");
const { verifyEmailConnection } = require("../email");

async function startNotificationService() {
    try {
        await connect();
        await verifyEmailConnection();

        await subscribeToQueue(
            "AUTH_NOTIFICATION_USER_CREATED",
            sendWelcomeEmail
        );

        await subscribeToQueue(
            "PAYMENT_PAYMENT.NOTIFICATION_COMPLETED",
            sendPaymentEmail
        );

        await subscribeToQueue(
            "PAYMENT_PAYMENT.NOTIFICATION_FAILED",
            sendPaymentFailedEmail
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
