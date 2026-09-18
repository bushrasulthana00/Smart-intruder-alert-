const nodemailer = require('nodemailer');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed' });
  }

  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;

  if (!mailUser || !mailPass) {
    return json(500, {
      success: false,
      message: 'Email is not configured. Add MAIL_USER and MAIL_PASS in Netlify environment variables.'
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return json(400, { success: false, message: 'Invalid JSON body' });
  }

  const { image, to, attempts, timestamp, userAgent } = payload;

  if (!image || !to) {
    return json(400, { success: false, message: 'Missing image or email' });
  }

  if (!emailPattern.test(to)) {
    return json(400, { success: false, message: 'Invalid recipient email' });
  }

  const imageMatch = image.match(/^data:(image\/(png|jpeg));base64,(.+)$/);
  if (!imageMatch) {
    return json(400, { success: false, message: 'Invalid image format' });
  }

  const contentType = imageMatch[1];
  const extension = imageMatch[2] === 'jpeg' ? 'jpg' : 'png';
  const imageContent = imageMatch[3];
  const attemptCount = Number.isInteger(Number(attempts)) ? Number(attempts) : 1;
  const safeTimestamp = String(timestamp || 'Unknown').replace(/[<>&]/g, '');
  const safeUserAgent = String(userAgent || 'Unknown').replace(/[<>&]/g, '');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailUser,
      pass: mailPass
    }
  });

  try {
    await transporter.sendMail({
      from: `"Intruder Alert" <${mailUser}>`,
      to,
      subject: `Intruder Alert - Failed Attempt #${attemptCount}`,
      html: `
        <h2 style="color:red;">Intruder Alert</h2>
        <p>Someone entered the wrong password on your device.</p>
        <table style="font-family:sans-serif;font-size:14px;">
          <tr><td><b>Time:</b></td><td>${safeTimestamp}</td></tr>
          <tr><td><b>Attempts:</b></td><td>${attemptCount}</td></tr>
          <tr><td><b>Device:</b></td><td>${safeUserAgent}</td></tr>
        </table>
        <p style="margin-top:16px;">Intruder photo is attached below.</p>
      `,
      attachments: [{
        filename: `intruder_attempt_${attemptCount}.${extension}`,
        content: imageContent,
        encoding: 'base64',
        contentType
      }]
    });

    return json(200, { success: true });
  } catch (error) {
    if (error.code === 'EAUTH') {
      return json(500, {
        success: false,
        message: 'Email login failed. Check MAIL_USER and Gmail App Password in Netlify.'
      });
    }

    return json(500, { success: false, message: error.message });
  }
};
