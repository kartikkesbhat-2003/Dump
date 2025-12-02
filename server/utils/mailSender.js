const emailjs = require('@emailjs/nodejs');
require('dotenv').config();

const mailSender = async (email, title, body) => {
    try {
        const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
        const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
        const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
        const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

        // Preparing to send email (sensitive details are not logged)

        if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !PRIVATE_KEY) {
            throw new Error("Missing EmailJS environment variables (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY)");
        }

        if (process.env.MAIL_DRY_RUN === 'true') {
            return { ok: true, dryRun: true };
        }

        const templateParams = {
            to_email: email,
            subject: title,
            message: body,
        };

        // Template parameters prepared (not logged for privacy)

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            {
                publicKey: PUBLIC_KEY,
                privateKey: PRIVATE_KEY,
            }
        );

        // Email sent successfully
        return response;
    } catch (error) {
        console.error('[mailSender] ❌ Failed to send email:', error?.message || error);
        throw error; // Re-throw to let caller handle it
    }
};

module.exports = mailSender;