const { sendEmail } = require('../email');

async function sendWelcomeEmail(data) {

    // 1. Console RabbitMQ data
    console.log("📩 User Created Event Received:");
    console.log(data);

    const firstName = data.fullname?.firstName;
    const lastName = data.fullname?.lastName;

    const fullName =
        [firstName, lastName]
            .filter(Boolean)
            .join(' ') || data.username;

    const html = `
        <h1>Welcome to our E-Commerce Platform!</h1>

        <p>Dear ${fullName},</p>

        <p>
            Thank you for registering with us.
            We are excited to have you on board!
        </p>

        <p>
            You can now explore products and start shopping.
        </p>

        <p>
            Best regards,<br/>
            The E-Commerce Team
        </p>
    `;

    const text = `
Welcome to our E-Commerce Platform!

Dear ${fullName},

Thank you for registering with us.
We are excited to have you on board!

Best regards,
The E-Commerce Team
`;

    console.log("📧 Sending welcome email to:", data.email);

    const info = await sendEmail({
        to: data.email,
        subject: "Welcome to our E-Commerce Platform",
        text,
        html,
    });

    console.log("✅ Welcome email sent successfully!");
    console.log("Message ID:", info.messageId);

    return info;
}

module.exports = {
    sendWelcomeEmail,
};