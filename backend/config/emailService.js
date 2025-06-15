// backend/config/emailService.js - SendGrid Implementation

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized');
} else {
  console.error('❌ SENDGRID_API_KEY not set');
}

// Get frontend URL based on environment
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://expense-tracker-cicd-pearl.vercel.app';
  }
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Send verification email using SendGrid
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    console.log('🔍 Starting SendGrid email process...');
    console.log('📧 Recipient:', email);
    console.log('🔐 Token:', verificationToken);
    
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SendGrid API key not configured');
      return {
        success: false,
        error: 'Email service not configured',
        verificationUrl: `${getFrontendUrl()}/verify-email/${verificationToken}`
      };
    }

    const frontendUrl = getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    console.log('🔗 Verification URL:', verificationUrl);
    console.log('📬 From email:', process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER);

    // Email content
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@expensetracker.com',
      subject: '🔐 Verify Your Email - Expense Tracker',
      text: `Welcome to Expense Tracker!

Please verify your email by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
Expense Tracker Team`,
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
      `,
    };

    console.log('📨 Sending email via SendGrid...');
    
    try {
      const result = await sgMail.send(msg);
      console.log('✅ Email sent successfully via SendGrid!');
      console.log('📧 Response:', result[0].statusCode);
      console.log('📧 Message ID:', result[0].headers['x-message-id']);
      
      return { 
        success: true, 
        messageId: result[0].headers['x-message-id'],
        method: 'sendgrid'
      };
      
    } catch (sendError) {
      console.error('❌ SendGrid error:', sendError);
      
      if (sendError.response) {
        console.error('SendGrid Error Body:', sendError.response.body);
        const errors = sendError.response.body.errors;
        if (errors && errors.length > 0) {
          errors.forEach(err => {
            console.error(`Field: ${err.field}, Message: ${err.message}`);
          });
        }
      }
      
      // Common SendGrid errors
      if (sendError.code === 401) {
        console.error('🔐 Invalid API Key - check SENDGRID_API_KEY');
      } else if (sendError.code === 403) {
        console.error('🔐 Sender not verified - verify sender in SendGrid dashboard');
      }
      
      return {
        success: false,
        error: sendError.message,
        verificationUrl: verificationUrl
      };
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    return {
      success: false,
      error: error.message,
      verificationUrl: `${getFrontendUrl()}/verify-email/${verificationToken}`
    };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid not configured');
    }

    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || 'noreply@expensetracker.com',
      subject: '🔑 Reset Your Password - Expense Tracker',
      text: `Reset Your Password

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Expense Tracker Team`,
      html: `
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
      `
    };

    await sgMail.send(msg);
    return { success: true };
    
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  console.log('🧪 Testing SendGrid configuration...');
  
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SENDGRID_API_KEY not set');
      return false;
    }
    
    console.log('✅ SendGrid API key is set');
    console.log('📧 From email:', process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER);
    
    // Try to send a test email
    const testEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
    if (testEmail) {
      const msg = {
        to: testEmail,
        from: testEmail,
        subject: '🧪 SendGrid Test - Expense Tracker',
        text: 'This is a test email from your Expense Tracker app. SendGrid is working!',
        html: '<p>This is a test email from your Expense Tracker app. <strong>SendGrid is working!</strong></p>'
      };
      
      await sgMail.send(msg);
      console.log('✅ Test email sent successfully!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ SendGrid test failed:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.body);
    }
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailConfiguration
};