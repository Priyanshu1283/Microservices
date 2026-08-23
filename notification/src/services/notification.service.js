const { sendEmail } = require('../email');

async function sendWelcomeEmail(data) {
    console.log("📩 User Created Event Received:", data);

    const firstName = data.fullname?.firstName;
    const lastName = data.fullname?.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || data.username || 'Customer';

    const html = `
        <h1>Welcome to Buy-Buddy!</h1>
        <p>Dear ${fullName},</p>
        <p>Thank you for registering with us. We are excited to have you on board!</p>
        <p>You can now explore products and start shopping.</p>
        <p>Best regards,<br/>The Buy-Buddy Team</p>
    `;

    const text = `Welcome to Buy-Buddy!\n\nDear ${fullName},\n\nThank you for registering with us.\n\nBest regards,\nThe Buy-Buddy Team`;

    console.log("📧 Sending welcome email to:", data.email);

    const info = await sendEmail({
        to: data.email,
        subject: "Welcome to Buy-Buddy",
        text,
        html,
    });

    console.log("✅ Welcome email sent successfully! Message ID:", info.messageId);
    return info;
}

async function sendPaymentEmail(data) {
    console.log("📩 Payment Completed Event Received:", data);

    const firstName = data.fullname?.firstName;
    const lastName = data.fullname?.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || data.username || data.email?.split('@')[0] || 'Customer';
    const orderId = data.orderId || data.orderID || 'N/A';

    const html = `
        <h1>Payment Successful!</h1>
        <p>Dear ${fullName},</p>
        <p>Your payment was processed successfully.</p>
        <p><b>Payment ID:</b> ${data.paymentId}</p>
        <p><b>Order ID:</b> ${orderId}</p>
        <p><b>Amount Paid:</b> ${data.currency || 'INR'} ${data.amount}</p>
        <br/>
        <p>Best regards,<br/>The Buy-Buddy Team</p>
    `;

    const text = `Payment Successful!\n\nDear ${fullName},\n\nYour payment of ${data.currency || 'INR'} ${data.amount} was successful.\nPayment ID: ${data.paymentId}\nOrder ID: ${orderId}\n\nBest regards,\nThe Buy-Buddy Team`;

    console.log("📧 Sending payment confirmation email to:", data.email);

    const info = await sendEmail({
        to: data.email,
        subject: "Payment Successful - Buy-Buddy",
        text,
        html,
    });

    console.log("✅ Payment email sent successfully! Message ID:", info.messageId);
    return info;
}

async function sendPaymentFailedEmail(data) {
    console.log("⛔ Payment Failed Event Received:", data);

    const firstName = data.fullname?.firstName;
    const lastName = data.fullname?.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || data.username || data.email?.split('@')[0] || 'Customer';
    const orderId = data.orderId || data.orderID || 'N/A';

    const html = `
        <h1>Payment Failed!</h1>
        <p>Dear ${fullName},</p>
        <p>We're sorry, but your payment could not be processed.</p>
        <p><b>Reason:</b> ${data.error || 'Verification Failed'}</p>
        <p><b>Order ID:</b> ${orderId}</p>
        <br/>
        <p>Please try again or contact our support team if the problem continues.</p>
        <p>Best regards,<br/>The Buy-Buddy Team</p>
    `;

    const text = `Payment Failed!\n\nDear ${fullName},\n\nYour payment could not be processed. Reason: ${data.error || 'Verification Failed'}.\nOrder ID: ${orderId}\n\nBest regards,\nThe Buy-Buddy Team`;

    console.log("📧 Sending payment failure email to:", data.email);

    const info = await sendEmail({
        to: data.email,
        subject: "Payment Failed - Buy-Buddy",
        text,
        html,
    });

    console.log("✅ Payment failure email sent successfully! Message ID:", info.messageId);
    return info;
}

module.exports = {
    sendWelcomeEmail,
    sendPaymentEmail,
    sendPaymentFailedEmail
};