import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: parseInt('465'),
    auth: {
      user: "labs@moreclariti.com",
      pass: "befj vneq aklt ekoh",
    },
  });

  await transporter.sendMail({
    from: "labs@moreclariti.com",
    to: email,
    subject: 'Verify your email',
    html: `
      <h1>Welcome to Clariti</h1>
      <p>Your verification code is:</p>
      <h2>${code}</h2>
      <p>This code will expire in 24 hours.</p>
    `,
  });
}