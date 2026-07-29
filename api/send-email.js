module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }
  }

  const { from_name, from_email, subject, message } = body;

  if (!from_name || !from_email || !subject || !message) {
    res.status(400).json({ error: 'Please fill out all fields before sending.' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;
  const toAddress = process.env.RESEND_TO_EMAIL || fromAddress;

  if (!apiKey || !fromAddress || !toAddress) {
    res.status(500).json({
      error: 'Resend is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and RESEND_TO_EMAIL in Vercel environment variables.',
    });
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [toAddress],
        reply_to: from_email,
        subject: `Portfolio Contact: ${subject}`,
        html: `
          <p><strong>Name:</strong> ${from_name}</p>
          <p><strong>Email:</strong> ${from_email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br />')}</p>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({
        error: data?.message || 'Unable to send the message right now.',
      });
      return;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Something went wrong while sending the email.',
    });
  }
};
