const nodemailer = require("nodemailer");

const emailService = {
  transporter: null,
  isConfigured: false,

  init: function () {
    // Check if credentials are properly configured (not placeholder values)
    const isPlaceholder =
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASSWORD ||
      process.env.EMAIL_USER.includes("your-email") ||
      process.env.EMAIL_PASSWORD.includes("your-app-password");

    if (isPlaceholder) {
      console.warn("Email service not configured - using placeholder credentials");
      console.warn("To enable password reset emails, set EMAIL_USER and EMAIL_PASSWORD in .env");
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      this.isConfigured = true;
      console.log("Email service configured and ready");
    } catch (err) {
      console.error("Failed to initialize email service:", err.message);
      this.isConfigured = false;
    }
  },

  sendOTP: async function (email, otp) {
    if (!this.isConfigured) {
      console.error("Email service not configured - cannot send OTP to", email);
      return {
        success: false,
        message: "Email service is not configured. Contact your administrator.",
      };
    }

    if (!this.transporter) this.init();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - Maestrominds CRM",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #333; margin: 0; }
            .otp-box { background: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4f8ef7; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .warning { color: #f87171; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 Maestrominds CRM</h1>
              <p>Password Reset Request</p>
            </div>
            <p>Hello,</p>
            <p>You requested to reset your password. Here is your OTP:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
            <div class="warning">
              ⚠️ Never share your OTP with anyone, not even support staff.
            </div>
            <div class="footer">
              <p>&copy; 2024 Maestrominds CRM. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("OTP sent to:", email);
      return { success: true, message: "OTP sent successfully" };
    } catch (err) {
      console.error("Failed to send OTP email:", err.message);
      return {
        success: false,
        message: "Failed to send OTP. Please try again later.",
      };
    }
  },

  sendPasswordChangeNotification: async function (email, name) {
    if (!this.isConfigured) {
      console.warn("Email service not configured - skipping password change notification");
      return { success: false };
    }

    if (!this.transporter) this.init();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Changed - Maestrominds CRM",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #333; margin: 0; }
            .success { color: #34d399; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 Maestrominds CRM</h1>
              <p>Security Alert</p>
            </div>
            <p>Hello ${name},</p>
            <p>Your password has been <span class="success">successfully changed</span>.</p>
            <p>If this was not done by you, please contact our support team immediately.</p>
            <div class="footer">
              <p>&copy; 2024 Maestrominds CRM. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Password change notification sent to:", email);
      return { success: true };
    } catch (err) {
      console.error("Failed to send password notification:", err.message);
      return { success: false };
    }
  },
};

// Initialize on first load
emailService.init();

module.exports = emailService;
