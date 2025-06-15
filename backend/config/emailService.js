// backend/config/emailService.js - Real Gmail SMTP using emailjs package

// Get frontend URL based on environment
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://expense-tracker-cicd-pearl.vercel.app';
  }
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Initialize email client with emailjs package
let emailClient = null;

const initializeEmailClient = async () => {
  try {
    // Import emailjs dynamically to avoid import issues
    const { SMTPClient } = require('emailjs');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Gmail credentials not configured');
      return null;
    }

    emailClient = new SMTPClient({
      user: process.env.EMAIL_USER,     // fintastic.tracker@gmail.com
      password: process.env.EMAIL_PASS, // kozzteofndzpwssj
      host: 'smtp.gmail.com',
      port: 465,
      ssl: true,
      timeout: 10000
    });

    console.log('✅ Email client initialized with Gmail SMTP');
    console.log('📧 From email:', process.env.EMAIL_USER);
    
    return emailClient;
  } catch (error) {
    console.error('❌ Failed to initialize email client:', error.message);
    return null;
  }
};

// Send verification email using emailjs
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    console.log('🔍 Starting real email sending process...');
    console.log('📧 Recipient:', email);
    console.log('🔐 Token:', verificationToken);
    
    // Initialize client if not already done
    if (!emailClient) {
      emailClient = await initializeEmailClient();
    }
    
    if (!emailClient) {
      console.error('❌ Email client not available');
      const frontendUrl = getFrontendUrl();
      const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
      
      console.log('================================');
      console.log('⚠️ EMAIL SERVICE UNAVAILABLE');
      console.log('🔗 MANUAL VERIFICATION URL:', verificationUrl);
      console.log('================================');
      
      return {
        success: false,
        error: 'Email service not configured',
        verificationUrl: verificationUrl
      };
    }

    const frontendUrl = getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    console.log('🔗 Verification URL:', verificationUrl);
    console.log('📬 From email:', process.env.EMAIL_USER);

    // Prepare email message
    const message = {
      from: `Expense Tracker <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verify Your Email - Expense Tracker',
      text: `Welcome to Expense Tracker!

Please verify your email by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
Expense Tracker Team`,
      attachment: [
        {
          data: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                  📊 Expense Tracker
                </h1>
                <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">
                  Verify your email to get started
                </p>
              </div>
              
              <!-- Content -->
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 24px;">
                  Welcome! 🎉
                </h2>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Thanks for signing up! You have <strong>24 hours of trial access</strong> to explore all features. 
                  Click the button below to verify your email and unlock unlimited access.
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${verificationUrl}" 
                     style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                            color: white; 
                            text-decoration: none; 
                            padding: 16px 32px; 
                            border-radius: 8px; 
                            font-weight: bold; 
                            font-size: 16px; 
                            display: inline-block;
                            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                    ✅ Verify Email Address
                  </a>
                </div>
                
                <!-- Trial Info -->
                <div style="background: #fef3cd; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
                  <p style="color: #92400e; margin: 0; font-size: 14px;">
                    <strong>⏰ Trial Access:</strong> You can use the app for 24 hours without verification. 
                    After that, you'll need to verify your email to continue.
                  </p>
                </div>
                
                <!-- Alternative Link -->
                <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0 0;">
                  Button not working? Copy and paste this link: <br>
                  <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
                </p>
                
                <!-- Footer -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                    This email was sent from Expense Tracker. If you didn't create an account, please ignore this email.
                  </p>
                </div>
              </div>
            </div>
          `,
          alternative: true
        }
      ]
    };

    console.log('📨 Sending email via Gmail SMTP...');
    
    try {
      const result = await emailClient.sendAsync(message);
      
      console.log('✅ Email sent successfully via Gmail!');
      console.log('📧 Message sent:', result.text);
      
      return { 
        success: true, 
        messageId: result.header['message-id'] || 'gmail-sent',
        method: 'gmail-smtp'
      };
      
    } catch (sendError) {
      console.error('❌ Gmail sending error:', sendError);
      
      // Common Gmail errors
      if (sendError.message.includes('Authentication')) {
        console.error('🔐 Authentication failed - check EMAIL_USER and EMAIL_PASS');
      } else if (sendError.message.includes('Connection')) {
        console.error('🌐 Connection failed - check internet connection');
      }
      
      return {
        success: false,
        error: sendError.message || 'Failed to send email',
        verificationUrl: verificationUrl
      };
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    const frontendUrl = getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    console.log('================================');
    console.log('⚠️ EMAIL SERVICE ERROR');
    console.log('🔗 MANUAL VERIFICATION URL:', verificationUrl);
    console.log('================================');
    
    return {
      success: false,
      error: error.message,
      verificationUrl: verificationUrl
    };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    if (!emailClient) {
      emailClient = await initializeEmailClient();
    }
    
    if (!emailClient) {
      throw new Error('Email client not configured');
    }

    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    const message = {
      from: `Expense Tracker <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔑 Reset Your Password - Expense Tracker',
      text: `Reset Your Password

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Expense Tracker Team`,
      attachment: [
        {
          data: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #374151; margin: 0 0 20px 0;">Password Reset Request</h2>
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Click the button below to reset your password:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 14px;">
                  This link will expire in 1 hour. If you didn't request this, please ignore this email.
                </p>
              </div>
            </div>
          `,
          alternative: true
        }
      ]
    };

    const result = await emailClient.sendAsync(message);
    console.log('✅ Password reset email sent:', result.text);
    return { success: true, messageId: result.header['message-id'] };
    
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  console.log('🧪 Testing Gmail configuration...');
  
  try {
    if (!emailClient) {
      emailClient = await initializeEmailClient();
    }
    
    if (!emailClient) {
      console.error('❌ Email client not initialized');
      return false;
    }
    
    console.log('✅ Gmail client ready');
    console.log('📧 From email:', process.env.EMAIL_USER);
    
    return true;
    
  } catch (error) {
    console.error('❌ Gmail test failed:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('Authentication')) {
      console.error('🔐 Fix: Check your app password at https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('Connection')) {
      console.error('🌐 Fix: Check your internet connection');
    }
    
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailConfiguration
};