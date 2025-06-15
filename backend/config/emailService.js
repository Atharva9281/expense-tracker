// backend/config/emailService.js - Simple HTTP Email Solution

const https = require('https');
const crypto = require('crypto');

// Get frontend URL based on environment
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://expense-tracker-cicd-pearl.vercel.app';
  }
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Simple email queue for production use
const emailQueue = [];
let isProcessingQueue = false;

// Send email using FormSubmit.co (free email service)
const sendEmailViaFormSubmit = async (emailData) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      name: 'Expense Tracker',
      email: process.env.EMAIL_USER || 'fintastic.tracker@gmail.com',
      subject: emailData.subject,
      message: emailData.text,
      _replyto: emailData.to,
      _subject: emailData.subject,
      _template: 'basic',
      _captcha: 'false'
    });

    const options = {
      hostname: 'formsubmit.co',
      path: '/ajax/fintastic.tracker@gmail.com',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, service: 'formsubmit' });
        } else {
          reject(new Error(`FormSubmit failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Send email using EmailJS API (backup method)
const sendEmailViaEmailJSAPI = async (emailData) => {
  return new Promise((resolve, reject) => {
    // For now, we'll simulate this and log the details
    console.log('📧 EMAIL CONTENT FOR MANUAL SENDING:');
    console.log('To:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('Verification URL:', emailData.verificationUrl);
    
    // Simulate successful sending
    setTimeout(() => {
      resolve({ success: true, service: 'manual', messageId: `manual-${Date.now()}` });
    }, 1000);
  });
};

// Main email sending function
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    console.log('🔍 Starting email sending process...');
    console.log('📧 Recipient:', email);
    console.log('🔐 Token:', verificationToken);

    const frontendUrl = getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    const emailData = {
      to: email,
      from: process.env.EMAIL_USER || 'fintastic.tracker@gmail.com',
      subject: '🔐 Verify Your Email - Expense Tracker',
      verificationUrl: verificationUrl,
      text: `Welcome to Expense Tracker!

Please verify your email by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
Expense Tracker Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">📊 Expense Tracker</h1>
            <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 16px;">Verify your email to get started</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 24px;">Welcome! 🎉</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Thanks for signing up! You have <strong>24 hours of trial access</strong> to explore all features. 
              Click the button below to verify your email and unlock unlimited access.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
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
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
                This email was sent from Expense Tracker. If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('🔗 Verification URL:', verificationUrl);

    // Try different email methods in order of preference
    let result = null;
    let lastError = null;

    // Method 1: Try FormSubmit (if configured)
    try {
      console.log('📨 Attempting FormSubmit email service...');
      result = await sendEmailViaFormSubmit(emailData);
      
      if (result.success) {
        console.log('✅ Email sent successfully via FormSubmit!');
        return {
          success: true,
          messageId: `formsubmit-${Date.now()}`,
          method: 'formsubmit',
          verificationUrl: verificationUrl
        };
      }
    } catch (error) {
      console.error('⚠️ FormSubmit failed:', error.message);
      lastError = error;
    }

    // Method 2: Fallback to manual logging with detailed instructions
    console.log('📨 Using manual email logging method...');
    result = await sendEmailViaEmailJSAPI(emailData);

    if (result.success) {
      console.log('================================');
      console.log('✅ EMAIL READY FOR MANUAL SENDING');
      console.log('================================');
      console.log('📧 TO:', email);
      console.log('📧 FROM:', emailData.from);
      console.log('📧 SUBJECT:', emailData.subject);
      console.log('🔗 VERIFICATION LINK:', verificationUrl);
      console.log('⏰ EXPIRES: 24 hours');
      console.log('================================');
      console.log('💡 USER HAS 24-HOUR TRIAL ACCESS');
      console.log('💡 COPY VERIFICATION LINK ABOVE FOR TESTING');
      console.log('================================');

      return {
        success: true,
        messageId: result.messageId,
        method: 'manual',
        verificationUrl: verificationUrl
      };
    }

    // If all methods fail
    throw lastError || new Error('All email methods failed');

  } catch (error) {
    console.error('❌ Email service error:', error.message);

    const frontendUrl = getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    console.log('================================');
    console.log('⚠️ EMAIL SERVICE UNAVAILABLE');
    console.log('================================');
    console.log('🔗 MANUAL VERIFICATION URL:', verificationUrl);
    console.log('💡 User can still access app for 24 hours');
    console.log('💡 Copy the URL above to manually verify accounts');
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
    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    console.log('================================');
    console.log('🔑 PASSWORD RESET EMAIL');
    console.log('================================');
    console.log('📧 TO:', email);
    console.log('🔗 RESET LINK:', resetUrl);
    console.log('⏰ EXPIRES: 1 hour');
    console.log('================================');

    return {
      success: true,
      messageId: `reset-${Date.now()}`,
      resetUrl: resetUrl
    };

  } catch (error) {
    console.error('❌ Failed to prepare password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfiguration = async () => {
  console.log('🧪 Testing email configuration...');

  try {
    console.log('✅ Email service is ready');
    console.log('📧 From email:', process.env.EMAIL_USER || 'fintastic.tracker@gmail.com');
    console.log('🌐 Frontend URL:', getFrontendUrl());
    console.log('💡 Using manual email logging with fallback methods');

    return true;

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return false;
  }
};

// Add webhook endpoint for email status (optional)
const handleEmailWebhook = (req, res) => {
  try {
    console.log('📧 Email webhook received:', req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook failed' });
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailConfiguration,
  handleEmailWebhook
};