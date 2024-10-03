import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || '';

interface VerifyRecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  const { token, email, name, phone, message } = await req.json();
  const missingFields = [];
  if (!token) missingFields.push('Token');
  if (!email) missingFields.push('Email');
  if (!name) missingFields.push('Name');
  if (!message) missingFields.push('Message');

  if (missingFields.length > 0) {
    return NextResponse.json({ success: false, message: `${missingFields.join(', ')} is/are missing` }, { status: 400 });
  }

  try {
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
    });

    const data: VerifyRecaptchaResponse = await response.json();

    if (data.success) {
      // Here you can add the logic to handle the form submission, e.g., sending an email
      const mailbody = JSON.stringify({ email, name, phone, message, ...data }, null, 2);
      let transporter = nodemailer.createTransport({
        // @ts-ignore  Object literal may only specify known properties, and 'service' does not exist in type 'TransportOptions'
        service: 'iCloud',
        port: 587,
        secureConnection: false, // TLS requires secureConnection to be false
        host: 'smtp.mail.me.com', 
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS    //app-specific password at https://appleid.apple.com/account/manage/section/security
        },
         tls: {
            ciphers:'SSLv3'
        }
      });

    let mailOptions = {
        from: 'prompt2.ai 👻 <pskarvelis@icloud.com>', // sender address 
        to: 'panagiotis@skarvelis.gr',
        subject: 'Prompt2.ai Contact Form Submission',
        text: mailbody,
        html: mailbody
    };
    try {
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ success: false, message: 'reCAPTCHA validation failed', errors: data['error-codes'] }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}