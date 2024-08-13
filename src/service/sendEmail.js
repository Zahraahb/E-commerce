import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html,attachments = []) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.emailSender,
      pass: process.env.password,
    },
  });

  const info = await transporter.sendMail({
    from: `"zahraa " <${process.env.emailSender}>`, // sender address
    to: to ? to : "",
    subject: subject ? subject : "Confirm Email",
    html: html ? html : "<h1>hello</h1>",
    attachments,
  });

  if (info.accepted.length) {
    return true;
  }
  return false;
};
