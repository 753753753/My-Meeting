const sgMail = require('@sendgrid/mail');

// Set your SendGrid API key
sgMail.setApiKey('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'); // API key must be in quotes

// Function to send email
const sendEmail = async (subject, text, recipientEmail) => {
  try {
    const msg = {
        to: recipientEmail, // Recipient email
        from: 'shyau9847@gmail.com', // Your email address (not verified yet)
        subject: subject, // Email subject
        text: text, // Email body
        mail_settings: {
          sandbox_mode: {
            enable: true, // Enable sandbox mode
          },
        },
      };

    const response = await sgMail.send(msg); // Send the email
    console.log('Email sent successfully:', response[0].statusCode); // Log the status code
  } catch (error) {
    console.error(
      'Error sending email:',
      error.response?.body?.errors || error.message // Log detailed error
    );
  }
};

// Test the function
sendEmail('Test Subject', 'This is a test email body.', 'recipient@example.com');
