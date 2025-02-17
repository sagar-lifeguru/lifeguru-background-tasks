import nodemailer, { Transporter, TransportOptions } from 'nodemailer';
import { logger } from './logger';

interface EmailConfig {
  service: string;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  from: string;
  to: string[];
  subject: string;
  text: string;
}

const emailConfig: EmailConfig = {
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "satyendra@lifeguru.app",
    pass: "agoq zhzt qsja kbik",
  },
};

const createTransporter = (): Transporter => {
  return nodemailer.createTransport(emailConfig as TransportOptions);
};

const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();
  try {
    await transporter.sendMail(options);
    logger.info('Email sent successfully');
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

interface ChildAstrologyEmailParams {
  userPhone: string;
  requestId: string;
  paymentStatus: string;
}

export const sendChildAstrologySuccessEmail = async ({
  userPhone,
  requestId,
  paymentStatus
}: ChildAstrologyEmailParams): Promise<void> => {
  const emailBody = `
    Dear Admin,

    A payment has been successfully done for child astrology report. PFB the details:
    Phone: ${userPhone}
    Transaction Request ID: ${requestId}
    Payment Status: ${paymentStatus}

    Regards,
    LifeGuru
  `;

  const mailOptions: EmailOptions = {
    from: 'satyendra@lifeguru.app',
    to: ['admin@lifeguru.app', 'prathamesh@lifeguru.app'],
    subject: `Child Astrology Report Transaction Successful <> Customer Phone : ${userPhone}`,
    text: emailBody,
  };

  await sendEmail(mailOptions);
};

interface PoojaEmailParams {
  userName: string;
  userPhone: string;
  paymentStatus: string;
  productName: string;
  amount: number;
  requestId: string;
}

export const sendPoojaSuccessEmail = async ({
  userName,
  userPhone,
  paymentStatus,
  productName,
  amount,
  requestId
}: PoojaEmailParams): Promise<void> => {
  const emailBody = `
    Hello Team,

    A payment has been successfully done for Pooja order. PFB the details:
    User Name: ${userName}
    User Phone Number: ${userPhone}
    Payment Status: ${paymentStatus}
    Pooja Name: ${productName}
    Total Amount: ${amount}
    Transaction Request ID: ${requestId}

    Regards,
    LifeGuru
  `;

  const mailOptions: EmailOptions = {
    from: 'satyendra@lifeguru.app',
    to: ['prathamesh@lifeguru.app', 'achintya@lifeguru.app', 'janak@lifeguru.app'],
    subject: `[Puja] Payment Successful <> ${userName} : ${userPhone}`,
    text: emailBody,
  };

  await sendEmail(mailOptions);
};

export const sendPoojaFailedEmail = async ({
  userName,
  userPhone,
  paymentStatus,
  productName,
  amount,
  requestId
}: PoojaEmailParams): Promise<void> => {
  const emailBody = `
    Hello Team,

    A payment has been failed for Pooja order. PFB the details:
    User Name: ${userName}
    User Phone Number: ${userPhone}
    Payment Status: ${paymentStatus}
    Pooja Name: ${productName}
    Total Amount: ${amount}
    Transaction Request ID: ${requestId}

    Regards,
    LifeGuru
  `;

  const mailOptions: EmailOptions = {
    from: 'satyendra@lifeguru.app',
    to: ['prathamesh@lifeguru.app', 'achintya@lifeguru.app', 'janak@lifeguru.app'],
    subject: `[Puja] Payment Failed <> ${userName} : ${userPhone}`,
    text: emailBody,
  };

  await sendEmail(mailOptions);
};

// // For Child Astrology
// await sendChildAstrologySuccessEmail({
//   userPhone: "1234567890",
//   requestId: "REQ123",
//   paymentStatus: "SUCCESS"
// });

// // For Pooja Success/Failure
// await sendPoojaSuccessEmail({
//   userName: "John Doe",
//   userPhone: "1234567890",
//   paymentStatus: "SUCCESS",
//   productName: "Ganesh Puja",
//   amount: 1000,
//   requestId: "REQ123"
// }); 