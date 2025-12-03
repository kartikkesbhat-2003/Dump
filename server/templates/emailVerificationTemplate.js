require('dotenv').config();

const APP_NAME = process.env.APP_NAME || 'Dump';
const APP_URL = 'https://dumpsocial.netlify.app/';
const SUPPORT_EMAIL = 'kkesbhat@gmail.com';

const otpTemplate = (otp) => {
		// Dark themed HTML email with plain-text friendly content
		return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Verify your email</title>
    <style>
      /* Reset */
      body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
      table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
      img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
      table { border-collapse:collapse !important; }
      body {
        margin:0;
        padding:0;
        width:100% !important;
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color:#050505;
      }

      /* Layout – dark DUMP theme */
      .bg {
        background-color:#050505;
        padding:40px 16px;
      }

      .card {
        width:100%;
        max-width:680px;
        margin:0 auto;
        background:linear-gradient(180deg,#050505,#0b0b0c);
        border-radius:16px;
        overflow:hidden;
        border:1px solid rgba(148,163,184,0.18);
        box-shadow:0 22px 80px rgba(0,0,0,0.7);
        color:#e5e7eb;
      }

      .header {
        padding:20px 24px;
        display:flex;
        align-items:center;
        gap:14px;
        border-bottom:1px solid rgba(55,65,81,0.7);
      }

      .logo {
        height:40px;
      }

      .brand {
        color:#f9fafb;
        font-weight:700;
        font-size:18px;
        letter-spacing:0.12em;
        text-transform:uppercase;
      }

      .tagline {
        margin-top:2px;
        font-size:11px;
        color:#9ca3af;
        text-transform:uppercase;
        letter-spacing:0.18em;
      }

      .content {
        padding:26px 26px 24px;
        color:#e5e7eb;
      }

      .preheader {
        display:block;
        color:#9ca3af;
        font-size:13px;
        margin-bottom:10px;
      }

      h1 {
        color:#f9fafb;
        margin:4px 0 12px;
        font-size:22px;
        letter-spacing:0.04em;
        text-transform:uppercase;
      }

      p {
        margin:0 0 14px;
        font-size:14px;
        line-height:1.6;
        color:#d1d5db;
      }

      .otp-wrap {
        text-align:center;
        margin:24px 0 18px;
      }

      .otp-label {
        font-size:12px;
        text-transform:uppercase;
        letter-spacing:0.18em;
        color:#9ca3af;
        margin-bottom:8px;
      }

      /* OTP box – subtle glow with accent */
      .otp {
        display:inline-block;
        background:radial-gradient(circle at top, rgba(248,250,252,0.06), rgba(15,23,42,0.9));
        border-radius:12px;
        padding:14px 26px;
        border:1px solid rgba(250,204,21,0.5);
        box-shadow:0 0 0 1px rgba(15,23,42,0.9), 0 20px 60px rgba(0,0,0,0.85);
        font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace;
        font-weight:800;
        font-size:26px;
        letter-spacing:8px;
        color:#facc15;
      }

      .btn-wrap {
        text-align:center;
        margin-top:6px;
      }

      .btn {
        display:inline-block;
        background:linear-gradient(135deg,#facc15,#f97316);
        color:#050505 !important;
        padding:10px 22px;
        border-radius:999px;
        text-decoration:none;
        font-weight:600;
        font-size:14px;
        border:1px solid rgba(0,0,0,0.8);
      }

      .btn span {
        text-transform:uppercase;
        letter-spacing:0.12em;
        font-size:11px;
      }

      .help {
        margin-top:18px;
        color:#9ca3af;
        font-size:12px;
      }

      .help a {
        color:#facc15;
        text-decoration:none;
      }

      .signature {
        margin-top:14px;
        font-size:13px;
        color:#6b7280;
      }

      .footer {
        padding:14px 26px 18px;
        border-top:1px solid rgba(31,41,55,0.7);
        font-size:11px;
        color:#6b7280;
        background:rgba(0,0,0,0.4);
      }

      .footer a {
        color:#facc15;
        text-decoration:none;
      }

      @media screen and (max-width:480px) {
        .card { border-radius:14px; }
        .content { padding:20px 18px 18px; }
        .header { padding:16px 18px; }
        .otp { font-size:22px; padding:12px 18px; letter-spacing:6px; }
      }
    </style>
  </head>
  <body>
    <!-- preview / preheader text -->
    <span style="display:none; max-height:0; max-width:0; opacity:0; overflow:hidden;">
      Use the one-time code below to verify your email address. It expires in 5 minutes.
    </span>

    <div class="bg">
      <div class="card" role="article" aria-roledescription="email">
        <!-- Header -->
        <div class="header">
          <a href="${APP_URL}" style="display:inline-flex;align-items:flex-start;text-decoration:none;"
            <div>
              <div class="brand">${APP_NAME}</div>
              <div class="tagline">Collective stream · Members only</div>
            </div>
          </a>
        </div>

        <!-- Body -->
        <div class="content">
          <div class="preheader">
            Drop your code below to unlock your account. This one-time code is valid for 5 minutes.
          </div>

          <h1>Verify your email</h1>

          <p>
            Hey, thanks for joining <strong>${APP_NAME}</strong>. To finish setting up your account,
            paste this code into the app. Once it’s confirmed, you’ll be ready to drop your first post.
          </p>

          <div class="otp-wrap">
            <div class="otp-label">Your access code</div>
            <div class="otp" aria-label="Your verification code">${otp}</div>
          </div>

          <div class="btn-wrap">
            <a class="btn" href="${APP_URL}">
              <span>Open ${APP_NAME}</span>
            </a>
          </div>

          <p class="help">
            Didn’t request this? You can safely ignore this email.
            For help, reach out at
            <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.
          </p>

          <p class="signature">
            — The ${APP_NAME} team
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          ${APP_NAME} · A quiet place to dump your thoughts ·
          <a href="${APP_URL}">Open site</a>
        </div>
      </div>
    </div>

    <!-- Plain-text fallback (visible in some clients / when copying) -->
    <!--
      ${APP_NAME} verification code: ${otp}
      Expires in 5 minutes.
      If you didn't request this, ignore this message or contact ${SUPPORT_EMAIL}.
    -->
  </body>
</html>
`;
};

module.exports = otpTemplate;