// backend/config/emailService.js - Simple Working Version

const nodemailer = require('nodemailer');
console.log('✅ Nodemailer loaded successfully');

// Get frontend URL based on environment
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://expense-tracker-cicd-pearl.vercel.app';
  }
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Send verification email - Simple and working
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    console.log('🔍 Starting email send process...');
    console.log('📧 Recipient:', email);
    console.log('🔐 Token:', verificationToken);
    
    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured');
      return {
        success: false,
        error: 'Email credentials not configured',
        verificationUrl: `${getFrontendUrl()}/verify-email/${verificationToken}`
      };
    }

    console.log('📋 Email configuration:', {
      user: process.env.EMAIL_USER,
      passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
      frontend: getFrontendUrl()
    });

    // Create transporter - Simple Gmail config
    console.log('🔧 Creating Gmail transporter...');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    console.log('✅ Transporter created');

    // Verify connection
    console.log('🔌 Verifying connection...');
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ Connection verification failed:', verifyError.message);
      // Continue anyway - sometimes verify fails but send works
    }

    const frontendUrl = getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    console.log('🔗 Verification URL:', verificationUrl);

    // Email content
    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verify Your Email - Expense Tracker',
      text: `Welcome to Expense Tracker!\n\nPlease verify your email by clicking the link below:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              📊 Expense Tracker
            </h1>
            <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">
              Verify your email to get started
            </p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 24px;">
              Welcome! 🎉
            </h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Thanks for signing up! You have <strong>24 hours of trial access</strong> to explore all features. 
              Click the button below to verify your email and unlock unlimited access.
            </p>
            
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
            
            <div style="background: #fef3cd; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⏰ Trial Access:</strong> You can use the app for 24 hours without verification. 
                After that, you'll need to verify your email to continue.
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0 0;">
              Button not working? Copy and paste this link: <br>
              <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
        </div>
      `
    };

    console.log('📨 Attempting to send email...');
    
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📧 Response:', result.response);
      
      return { 
        success: true, 
        messageId: result.messageId
      };
    } catch (sendError) {
      console.error('❌ Send mail error:', sendError.message);
      console.error('Error code:', sendError.code);
      
      // Common Gmail errors
      if (sendError.code === 'EAUTH') {
        console.error('🔐 Authentication failed - check app password');
        console.error('1. Go to: https://myaccount.google.com/apppasswords');
        console.error('2. Generate new app password');
        console.error('3. Update EMAIL_PASS in Render');
      }
      
      // Return with manual verification URL
      return {
        success: false,
        error: sendError.message,
        verificationUrl: verificationUrl,
        message: 'Email failed but you can still verify manually'
      };
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    
    // Always return verification URL so users can verify
    return {
      success: false,
      error: error.message,
      verificationUrl: `${getFrontendUrl()}/verify-email/${verificationToken}`
    };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  console.log('🧪 Testing email configuration...');
  
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not set');
      return false;
    }
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  testEmailConfiguration
};