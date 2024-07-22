import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "zahraahb55@gmail.com",
      pass: "sirvuzjivtybcrhc",
    },
  });

  const info = await transporter.sendMail({
    from: '"zahraa " <zahraahb55@gmail.com>', // sender address
    to: to ? to : "",
    subject: subject ? subject : "Confirm Email",
    html: html ? html : "<h1>hello</h1>",
  });

  if (info.accepted.length) {
    return true;
  }
  return false;
};
