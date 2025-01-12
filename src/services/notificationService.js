import twilio from 'twilio';
import nodemailer from 'nodemailer';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function sendEmergencyNotification(complaintDetails) {
  const message = `
    EMERGENCY COMPLAINT
    Unit: ${complaintDetails.unit}
    Time: ${new Date(complaintDetails.timestamp).toLocaleString()}
    Description: ${complaintDetails.description}
    Tenant Phone: ${complaintDetails.phoneNumber}
  `;

  try {
    // Send SMS
    await client.messages.create({
      body: message,
      to: process.env.MANAGER_PHONE,
      from: process.env.TWILIO_PHONE
    });

    // Send Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.MANAGER_EMAIL,
      subject: `EMERGENCY: Unit ${complaintDetails.unit} Complaint`,
      text: message
    });
  } catch (error) {
    console.error('Error sending emergency notification:', error);
  }
}

export async function sendDailyReport(complaints) {
  if (complaints.length === 0) return;

  const reportText = complaints
    .map(complaint => `
      Unit: ${complaint.unit}
      Time: ${new Date(complaint.timestamp).toLocaleString()}
      Description: ${complaint.description}
      Priority: ${complaint.isEmergency ? 'Emergency' : 'Normal'}
      Tenant Phone: ${complaint.phoneNumber}
      ----------------------------------------
    `)
    .join('\n');

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.MANAGER_EMAIL,
      subject: `Daily Maintenance Report - ${new Date().toLocaleDateString()}`,
      text: reportText
    });
  } catch (error) {
    console.error('Error sending daily report:', error);
  }
}