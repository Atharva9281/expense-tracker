// backend/config/emailService.js - Fixed Working Version

const nodemailer = require('nodemailer');

// Get frontend URL based on environment
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://expense-tracker-cicd-pearl.vercel.app';
  }
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    console.log('🔍 Starting email send process...');
    console.log('📧 Recipient:', email);
    console.log('🔐 Token:', verificationToken);
    
    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured');
      console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
      console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
      throw new Error('Email credentials not configured in environment variables');
    }

    console.log('📋 Email configuration:', {
      user: process.env.EMAIL_USER,
      passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
      frontend: getFrontendUrl()
    });

    // Create transporter
    console.log('🔧 Creating Gmail transporter...');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('✅ Transporter created successfully');

    // Verify connection
    console.log('🔌 Verifying Gmail connection...');
    try {
      await transporter.verify();
      console.log('✅ Gmail connection verified successfully');
    } catch (verifyError) {
      console.error('❌ Gmail verification failed:', verifyError.message);
      console.error('Error code:', verifyError.code);
      console.error('Response:', verifyError.response);
      
      if (verifyError.code === 'EAUTH') {
        console.error('🔐 Authentication failed. Check:');
        console.error('1. EMAIL_USER is correct:', process.env.EMAIL_USER);
        console.error('2. EMAIL_PASS is an app password (not regular password)');
        console.error('3. 2FA is enabled on Google account');
        console.error('4. App password is valid and not revoked');
      }
      
      throw verifyError;
    }

    const frontendUrl = getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    console.log('🔗 Verification URL:', verificationUrl);
    
    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verify Your Email - Expense Tracker',
      text: `Welcome to Expense Tracker!\n\nPlease verify your email by clicking the link below:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`,
      html: `
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
                This email was sent from Expense Tracker. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('📨 Sending email to:', email);
    console.log('📨 From:', process.env.EMAIL_USER);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    
    return { 
      success: true, 
      messageId: result.messageId,
      response: result.response 
    };
    
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response:', error.response);
    console.error('Full error:', error);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      console.error('🔐 Gmail authentication failed');
      console.error('Make sure you are using an App Password, not your regular password');
      console.error('Generate one at: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ESOCKET') {
      console.error('🌐 Network connection issue');
    } else if (error.responseCode === 535) {
      console.error('🔐 Invalid credentials - check EMAIL_USER and EMAIL_PASS');
    }
    
    throw new Error('Failed to send verification email: ' + error.message);
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔑 Reset Your Password - Expense Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  console.log('🧪 Testing email configuration...');
  
  try {
    const result = await sendVerificationEmail(process.env.EMAIL_USER, 'test-token-12345');
    
    if (result.success) {
      console.log('✅ Email test successful!');
      return true;
    } else {
      console.error('❌ Email test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Email test error:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailConfiguration
};