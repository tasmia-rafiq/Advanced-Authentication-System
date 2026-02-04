// import { createTransport } from "nodemailer";

// const sendMail = async ({ to, subject, html }) => {
//   try {
//     const transporter = createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//       connectionTimeout: 10_000,
//       greetingTimeout: 10_000,
//       socketTimeout: 10_000,
//     });

//     await transporter.sendMail({
//       from: process.env.SMTP_USER,
//       to,
//       subject,
//       html,
//     });

//     console.log("Email sent successfully!");
//   } catch (error) {
//     console.error("SMTP ERROR:", {
//       message: error.message,
//       code: error.code,
//       response: error.response,
//     });
//     throw error;
//   }
// };

// export default sendMail;

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent via Resend:", to);
  } catch (error) {
    console.error("Resend email error:", error);
    throw error;
  }
};

export default sendMail;