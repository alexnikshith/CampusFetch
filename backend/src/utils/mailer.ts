import nodemailer from 'nodemailer';

const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  // Gmail shorthand: if user looks like a Gmail address
  if (smtpUser && smtpPass && smtpUser.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return null;
};

export const sendOtpEmail = async (email: string, otp: string): Promise<boolean> => {
  console.log(`\n====================================================`);
  console.log(`[CampusFetch OTP Dispatch]`);
  console.log(`To: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`====================================================\n`);

  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[Mailer] No SMTP credentials configured. OTP logged to console only.');
    console.warn('[Mailer] Set SMTP_HOST, SMTP_USER, SMTP_PASS environment variables on Render.');
    return false;
  }

  try {
    const fromName = process.env.SMTP_FROM_NAME || 'CampusFetch Security';
    const fromAddr = process.env.SMTP_USER || 'no-reply@campusfetch.in';

    await transporter.sendMail({
      from: `"${fromName}" <${fromAddr}>`,
      to: email,
      subject: '🔐 CampusFetch – Your Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #8c182b; color: white; font-weight: 900; font-size: 22px; padding: 10px 20px; border-radius: 12px; letter-spacing: -0.5px;">
              CampusFetch
            </div>
            <p style="color: #6b7280; font-size: 13px; margin-top: 8px;">Amrita Vishwa Vidyapeetham – Peer Logistics Platform</p>
          </div>
          <h2 style="font-size: 18px; color: #111827; margin-bottom: 8px;">Verify your college email</h2>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 24px;">Enter the OTP below on the CampusFetch registration screen. This code expires in <strong>10 minutes</strong>.</p>
          <div style="background: #fef2f2; border: 2px solid #8c182b; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Your 6-Digit OTP</p>
            <h1 style="font-size: 42px; font-weight: 900; color: #8c182b; letter-spacing: 12px; margin: 0;">${otp}</h1>
          </div>
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">Do not share this OTP with anyone. CampusFetch will never ask for your OTP.</p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
          <p style="font-size: 11px; color: #d1d5db; text-align: center;">CampusFetch · Students helping students, one trip at a time.</p>
        </div>
      `,
    });

    console.log(`[Mailer] OTP email successfully sent to: ${email}`);
    return true;
  } catch (err: any) {
    console.error('[Mailer] Failed to send OTP email:', err.message || err);
    return false;
  }
};
