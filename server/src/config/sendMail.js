import { createTransport } from "nodemailer";

const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully!");
  } catch (error) {
    console.log("Error sending email!", error);
  }
};

export default sendMail;
