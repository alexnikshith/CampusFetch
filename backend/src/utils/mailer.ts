import nodemailer from 'nodemailer';

// Configure test/development nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || 'campusfetch_dev@amrita.edu',
    pass: process.env.SMTP_PASS || 'mockpass123',
  },
});

export const sendOtpEmail = async (email: string, otp: string): Promise<boolean> => {
  console.log(`\n==================================================`);
  console.log(`[CampusFetch NodeMailer OTP Dispatch]`);
  console.log(`To: ${email}`);
  console.log(`Security Verification OTP: ${otp}`);
  console.log(`Expiration: 5 Minutes`);
  console.log(`==================================================\n`);

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      await transporter.sendMail({
        from: '"CampusFetch Security" <no-reply@amrita.edu>',
        to: email,
        subject: 'CampusFetch Account Verification OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">CampusFetch Verification Code</h2>
            <p>Hello,</p>
            <p>Your 6-digit OTP code to verify your college account is:</p>
            <h1 style="background: #f3f4f6; padding: 10px 20px; letter-spacing: 5px; display: inline-block; border-radius: 8px; color: #4f46e5;">${otp}</h1>
            <p>This code expires in 5 minutes. Do not share this OTP with anyone.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
            <p style="font-size: 12px; color: #888;">CampusFetch - Students helping students, one trip at a time. Amrita Vishwa Vidyapeetham.</p>
          </div>
        `,
      });
    }
    return true;
  } catch (err) {
    console.warn('[Mailer Warning] Failed to send remote SMTP email, logged OTP to console:', err);
    return true; // Return true as dev fallback
  }
};
