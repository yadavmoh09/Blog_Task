const nodemailer = require("nodemailer");

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "moh09yadav@gmail.com", // Your email address
    pass: "generated_app_password", // Use the generated app password here
  },
});

// Define email content
const mailOptions = {
  from: "moh09yadav@gmail.com", // Sender address
  to: "yadavmoh09@gmail.com", // List of recipients
  subject: "Test Email", // Subject line
  text: "Hello, this is a test email!", // Plain text body
  html: "<b>Hello, this is a test email!</b>", // HTML body
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error occurred:", error);
  } else {
    console.log("Email sent successfully:", info.response);
  }
});
