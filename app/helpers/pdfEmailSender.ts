import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "labs@moreclariti.com",
    pass: "befj vneq aklt ekoh",
  },
});

export async function sendPdfEmail(email: string, pdfBuffer: Buffer, pdfName: string) {
  try {
    await transporter.sendMail({
      from: "labs@moreclariti.com",
      to: email,
      subject: `Your PDF: ${pdfName}`,
      text: `Please find attached your PDF: ${pdfName}`,
      attachments: [
        {
          filename: `${pdfName}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log('PDF email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending PDF email:', error);
    return false;
  }
}