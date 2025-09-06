const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
    return null;
  }

  // For development, you can use Gmail or other email services
  // For production, consider using services like SendGrid, AWS SES, etc.
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    console.log('Creating Gmail transporter...');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
      },
      // Add debug info for troubleshooting
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    });
  }
  
  // Generic SMTP configuration
  console.log('Creating SMTP transporter...');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    // Add debug info for troubleshooting
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });
};

// Send verification email
const sendVerificationEmail = async (email, username, verificationCode) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, error: 'Email configuration not found' };
    }

    // Verify transporter configuration
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Gaming Marketplace Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Gaming Marketplace</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${username}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for registering with Gaming Marketplace. To complete your registration and start trading, 
              please verify your email address using the verification code below:
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 30px 0; text-align: center;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                ${verificationCode}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong>
              <br>• This code will expire in 15 minutes
              <br>• Enter this code in the verification form to activate your account
              <br>• If you didn't create this account, please ignore this email
            </p>
            
            <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
              <p style="color: #1976d2; margin: 0; font-size: 14px;">
                <strong>Need help?</strong> If you're having trouble with verification, 
                contact our support team or try requesting a new verification code.
              </p>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 Gaming Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, username, resetCode) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, error: 'Email configuration not found' };
    }

    // Verify transporter configuration
    await transporter.verify();
    console.log('Email transporter verified successfully');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Gaming Marketplace Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Gaming Marketplace</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello ${username}, we received a request to reset your password. 
              Use the code below to reset your password:
            </p>
            
            <div style="background: white; border: 2px solid #f44336; border-radius: 10px; padding: 20px; margin: 30px 0; text-align: center;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Reset Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #f44336; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                ${resetCode}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong>
              <br>• This code will expire in 15 minutes
              <br>• If you didn't request this reset, please ignore this email
              <br>• Your password will remain unchanged until you use this code
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 Gaming Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
