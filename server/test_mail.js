require('dotenv').config();
// Quick test harness for mailSender. By default this runs in DRY_RUN so it won't send real mail.
process.env.MAIL_DRY_RUN = process.env.MAIL_DRY_RUN || 'true';

const mailSender = require('./utils/mailSender');

(async () => {
  try {
    console.log('Running mailSender test (DRY_RUN=' + process.env.MAIL_DRY_RUN + ')');
    const res = await mailSender('your-test-recipient@example.com', 'Test email from Dump', '<p>Hello from test harness</p>');
    console.log('mailSender result:', res);
  } catch (err) {
    console.error('mailSender error:', err);
  }
})();
