// server/src/templates/emailTemplates.ts

// Chat Request Email Template
export function chatRequestTemplate({ senderName, receiverName, chatLink }: { senderName: string, receiverName: string, chatLink: string }) {
  return `
    <div style="font-family:sans-serif;color:#222;">
      <h2 style="color:#2196f3;">TutorMitra - New Chat Request</h2>
      <p>Hello ${receiverName},</p>
      <p>You received a new chat request from <strong>${senderName}</strong>.</p>
      <a href="${chatLink}" style="display:inline-block;margin-top:15px;padding:10px 20px;background:#2196f3;color:#fff;border-radius:6px;text-decoration:none;">
        Open Chat
      </a>
      <hr/>
      <small style="color:gray;">Thanks for using TutorMitra!</small>
    </div>
  `;
}

// Payment Notification Email Template
export function paymentNotificationTemplate({ name, amount, status }: { name: string, amount: number, status: string }) {
  return `
    <div style="font-family:sans-serif;color:#222;">
      <h2 style="color:#26a69a;">TutorMitra Payment Status</h2>
      <p>Hello ${name},</p>
      <p>Your payment of <strong>₹${amount}</strong> is <span style="color:#26a69a;font-weight:bold;">${status}</span>.</p>
      <hr/>
      <small style="color:gray;">Need help? Reply to this email.</small>
    </div>
  `;
}

// Booking Confirmation Email Template
export function bookingConfirmationTemplate({ name, courseName, time, tutorName }: { name: string, courseName: string, time: string, tutorName: string }) {
  return `
    <div style="font-family:sans-serif;color:#222;">
      <h2 style="color:#ffd600;">TutorMitra Booking Confirmed</h2>
      <p>Hello ${name},</p>
      <p>Your booking for <strong>${courseName}</strong> with <strong>${tutorName}</strong> on <strong>${time}</strong> is confirmed!</p>
      <hr/>
      <small style="color:gray;">Thanks for choosing TutorMitra.</small>
    </div>
  `;
}

// Generic Notification Email Template
export function genericNotificationTemplate({ name, message }: { name: string, message: string }) {
  return `
    <div style="font-family:sans-serif;color:#222;">
      <h2 style="color:#7e57c2;">TutorMitra Notification</h2>
      <p>Hello ${name},</p>
      <p>${message}</p>
      <hr/>
      <small style="color:gray;">TutorMitra Team</small>
    </div>
  `;
}
