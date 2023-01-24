const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '861a0310e1aae9',
      pass: 'a6859cd4a57800'
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'yonas yonimelkamu357@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
