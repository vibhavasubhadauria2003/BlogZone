import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
      const info = {
          from: process.env.EMAIL_USER,
          to,
          subject,
          text,
          html
      }
      console.log(info);
      const result = await transporter.sendMail(info);
      console.log('Email sent successfully');
      console.log(result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


export { sendEmail };