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
      html: `
      <!DOCTYPE html>
 <html lang="en">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Clariti Verification Code</title>
     <style>
         body {
             font-family: Arial, sans-serif;
             line-height: 1.6;
             color: #333;
             width: 98vw;
             margin: auto;
 
             display: flex;
             align-items: center;
             justify-content: center;
         
         }
         .up{
             max-width: 400px;
             width: 100%;
         }
         .header {
             background-color: #0033A0;
             color: white;
             padding: 10px 20px;
             display: flex;
             justify-content: space-between;
             align-items: center;
         }
         .logo {
             font-size: 24px;
             font-weight: bold;
         }
         .lock-icon {
             font-size: 24px;
         }
         .content {
             padding: 20px;
         }
         .code {
             background-color: #f5f5f5;
             font-size: 24px;
             font-weight: bold;
             text-align: center;
             padding: 10px;
             margin: 20px 0;
         }
         .footer {
             font-size: 12px;
             text-align: center;
             margin-top: 40px;
             color: #666;
         }
          a {
             color: black;
             text-decoration: none;
         }
         .social-icons{
             margin-top: 10px;
             display: flex;
             align-content: center;
             justify-content: center;
             gap: 4px;
         }
         .social-icons svg {
 
             width: 20px;
             margin: 0 10px;
         }
     </style>
 </head>
 <body>
     <div class="up">
 
         <div class="header">
             <div class="logo">Clariti</div>
             <div class="lock-icon">🔒</div>
         </div>
         <div class="content">
             <h1>Welcome to Clariti</h1>
             <p>Hi,</p>
             
            <p>Please find attached your PDF: <strong>${pdfName}</strong>.</p>
             <p>Yours sincerely,</p>
             <p>Clariti Team</p>
         </div>
     <div class="footer">
          © All Rights Reserved-<br>
         Clariti Health Insights
     </div>
       <div class="social-icons">
         <a href="https://facebook.com"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-facebook">
             <path stroke="none" d="M0 0h24v24H0z" fill="none" />
             <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
           </svg></a>
         <a href="https://twitter.com"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-x">
             <path stroke="none" d="M0 0h24v24H0z" fill="none" />
             <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
             <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
           </svg></a>
         <a href="https://tiktok.com"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-tiktok">
             <path stroke="none" d="M0 0h24v24H0z" fill="none" />
             <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
           </svg></a>
         <a href="https://instagram.com"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-instagram">
             <path stroke="none" d="M0 0h24v24H0z" fill="none" />
             <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
             <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
             <path d="M16.5 7.5l0 .01" />
           </svg></a>
         <a href="https://youtube.com"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-brand-youtube">
             <path stroke="none" d="M0 0h24v24H0z" fill="none" />
             <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
             <path d="M10 9l5 3l-5 3z" />
           </svg></a>
         
     </div>
 </div>
 </body>
 </html>
       `,
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