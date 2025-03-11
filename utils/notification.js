const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmailNotification = async (email, subject, action, request, baseUrl) => {
  // Generate the URL for the admin to view/modify the request
  const requestUrl = `${baseUrl}/requests/${request._id}`;

  // Email content
  const htmlContent = `
    <h2>Request ${action}</h2>
    <p>Request Title: ${request.request_title}</p>
    <p>Requested By: ${request.requested_by}</p>
    <p>Status: ${request.status}</p>
    <p>Items:</p>
    <ul>
      ${request.items.map(item => `
        <li>${item.item_name} - Quantity: ${item.quantity} - Purpose: ${item.purpose}</li>
      `).join('')}
    </ul>
    <p>Click <a href="${requestUrl}">here</a> to view or take action on this request.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};