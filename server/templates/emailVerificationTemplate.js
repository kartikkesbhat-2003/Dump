require('dotenv').config();

const APP_NAME = process.env.APP_NAME || 'Dump';
const APP_URL = process.env.APP_URL || 'https://dump-eight.vercel.app/';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.MAIL_USER || 'support@dump.app';

const otpTemplate = (otp) => {
	return `<!doctype html>
	<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
		<head>
			<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Verify your email</title>
			<style>
				/* Reset */
				body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
				table,td{ mso-table-lspace:0pt; mso-table-rspace:0pt; }
				img{ -ms-interpolation-mode:bicubic; }
				img{ border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
				table{ border-collapse:collapse !important; }
				body{ margin:0 !important; padding:0 !important; width:100% !important; }

				/* Container */
				.email-body{ background-color:#f4f6f8; padding:40px 16px; }
				.email-container{ max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 6px 18px rgba(20,30,50,0.08); }

				/* Header */
				.header{ background:linear-gradient(90deg,#ffd254,#ffbf2f); padding:20px 24px; text-align:left; }
				.logo{ height:48px; }

				/* Content */
				.content{ padding:32px 28px; color:#1f2937; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
				.preheader{ color:#6b7280; font-size:13px; margin-bottom:8px; }
				h1{ font-size:20px; margin:8px 0 16px; color:#111827; }
				p{ margin:0 0 14px; font-size:15px; line-height:1.5; }

				/* OTP box */
				.otp-box{ display:inline-block; background:#111827; color:#ffffff; font-weight:700; font-size:24px; letter-spacing:6px; padding:14px 22px; border-radius:8px; margin:16px 0; }

				/* CTA */
				.cta{ display:inline-block; background:#ffb703; color:#07112a; text-decoration:none; padding:12px 18px; border-radius:8px; font-weight:600; }

				/* Footer */
				.footer{ padding:20px 28px; font-size:13px; color:#6b7280; background:#fbfbfc; }

				@media screen and (max-width:480px){ .content{ padding:20px 18px; } .header{ padding:16px; } }
			</style>
		</head>
		<body style="background-color:#f4f6f8;">
			<div class="email-body">
				<div class="email-container" role="article" aria-roledescription="email">
					<div class="header">
						<a href="${APP_URL}" style="display:inline-block;">
							<img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png" alt="${APP_NAME}" />
						</a>
					</div>

					<div class="content">
						<div class="preheader">Use the one-time code below to verify your email address. It expires in 5 minutes.</div>
						<h1>Verify your email</h1>
						<p>Hi there,</p>
						<p>Thanks for signing up for ${APP_NAME}. To complete your registration, enter the verification code below in the app.</p>

						<div style="text-align:center;">
							<div class="otp-box">${otp}</div>
						</div>

						<p>If you didn't request this code, you can safely ignore this email. For help, contact <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>

						<p style="margin-top:18px;">— The ${APP_NAME} team</p>

						<div style="margin-top:22px;">
							<a class="cta" href="${APP_URL}">Open ${APP_NAME}</a>
						</div>
					</div>

					<div class="footer">
						<div style="margin-bottom:6px;">${APP_NAME} • Building learning communities</div>
						<div>If you didn't create an account using this email address, please ignore this message or <a href="mailto:${SUPPORT_EMAIL}">contact support</a>.</div>
					</div>
				</div>
			</div>
		</body>
	</html>`;
};

module.exports = otpTemplate;