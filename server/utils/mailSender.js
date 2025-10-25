const nodemailer = require("nodemailer");
require('dotenv').config()


const mailSender = async (email, title, body) => {
    try{
            // Defensive trimming of env values (some .env files include spaces around =)
            const MAIL_HOST = process.env.MAIL_HOST ? process.env.MAIL_HOST.trim() : undefined;
            const MAIL_USER = process.env.MAIL_USER ? process.env.MAIL_USER.trim() : undefined;
            const MAIL_PASS = process.env.MAIL_PASS ? process.env.MAIL_PASS.trim() : undefined;
            const MAIL_PORT = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT.trim()) : 587;
            const MAIL_SECURE = process.env.MAIL_SECURE === 'true' || MAIL_PORT === 465;

            // Log non-sensitive connection info to help debugging (don't log the password)
            console.log("[mailSender] transport config:", { host: MAIL_HOST, port: MAIL_PORT, secure: MAIL_SECURE, user: MAIL_USER ? (MAIL_USER.slice(0,3) + '...') : undefined });

            let transporter = nodemailer.createTransport({
                host: MAIL_HOST,
                port: MAIL_PORT,
                secure: MAIL_SECURE,
                auth: MAIL_USER && MAIL_PASS ? {
                    user: MAIL_USER,
                    pass: MAIL_PASS,
                } : undefined,
            })

            // Verify connection configuration — this will attempt to connect to the SMTP server and fail fast with helpful errors
            try {
                await transporter.verify();
                console.log('[mailSender] transporter verified: connection configuration looks good');
            } catch (verifyErr) {
                console.log('[mailSender] transporter verification failed:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
                // continue — sendMail will also surface errors, but verification failure is often the root cause
            }


            // Support a DRY_RUN mode to avoid sending real emails during local testing
            if (process.env.MAIL_DRY_RUN === 'true') {
                console.log('[mailSender] DRY_RUN enabled — skipping actual send');
                return { ok: true, dryRun: true };
            }

            let info = await transporter.sendMail({
                from: `"${process.env.APP_NAME || 'Dump'}" <${MAIL_USER || process.env.MAIL_USER}>`,
                to: `${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            console.log(info);
            return info;
    }
    catch(error) {
        console.log(error.message);
        return error;
    }
}


module.exports = mailSender;