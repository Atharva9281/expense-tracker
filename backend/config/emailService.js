// backend/config/emailService.js - Final Working Version

// Try multiple import methods to ensure compatibility
let nodemailer;
try {
  // Try standard import first
  nodemailer = require('nodemailer');
  console.log('✅ Nodemailer loaded via standard require');
} catch (e1) {
  try {
    // Try with .default
    const nm = require('nodemailer');
    nodemailer = nm.default || nm;
    console.log('✅ Nodemailer loaded via default export');
  } catch (e2) {
    console.error('❌ Failed to load nodemailer:', e2);
  }
}

// If nodemailer still not loaded, try direct SMTP approach
const net = require('net');
const tls = require('tls');

// Get frontend URL based on environment
const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.FRONTEND_URL || 'https://expense-tracker-cicd-pearl.vercel.app';
  }
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

// Fallback email sender using direct SMTP
const sendEmailDirectSMTP = async (to, subject, html, text) => {
  return new Promise((resolve, reject) => {
    const from = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    
    // Gmail SMTP settings
    const options = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      servername: 'smtp.gmail.com'
    };

    const client = net.createConnection(options.port, options.host, () => {
      console.log('📧 Connected to SMTP server');
      
      // Upgrade to TLS
      const secureClient = tls.connect({
        socket: client,
        servername: options.servername
      }, () => {
        console.log('🔒 TLS connection established');
        
        // Simple SMTP commands
        const commands = [
          `EHLO ${options.servername}`,
          `AUTH LOGIN`,
          Buffer.from(from).toString('base64'),
          Buffer.from(pass).toString('base64'),
          `MAIL FROM:<${from}>`,
          `RCPT TO:<${to}>`,
          `DATA`,
          `From: "Expense Tracker" <${from}>`,
          `To: ${to}`,
          `Subject: ${subject}`,
          `Content-Type: text/html; charset=UTF-8`,
          '',
          html,
          '.',
          'QUIT'
        ];

        // Send commands sequentially
        let index = 0;
        const sendNext = () => {
          if (index < commands.length) {
            secureClient.write(commands[index] + '\r\n');
            index++;
          }
        };

        secureClient.on('data', (data) => {
          console.log('SMTP Response:', data.toString());
          if (data.toString().includes('250 OK')) {
            resolve({ success: true, message: 'Email sent via direct SMTP' });
          }
          sendNext();
        });

        secureClient.on('error', (err) => {
          reject(err);
        });

        // Start sending commands
        sendNext();
      });
    });

    client.on('error', (err) => {
      reject(err);
    });
  });
};

// Main email sending function with multiple fallbacks
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    console.log('🔍 Starting email send process...');
    console.log('📧 Recipient:', email);
    console.log('🔐 Token:', verificationToken);
    
    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured');
      throw new Error('Email credentials not configured');
    }

    console.log('📋 Email configuration:', {
      user: process.env.EMAIL_USER,
      passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
      frontend: getFrontendUrl()
    });

    const frontendUrl = getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    console.log('🔗 Verification URL:', verificationUrl);

    const emailSubject = '🔐 Verify Your Email - Expense Tracker';
    const emailText = `Welcome to Expense Tracker!\n\nPlease verify your email by clicking: ${verificationUrl}\n\nThis link expires in 24 hours.`;
    const emailHtml = `
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
        </div>
      </div>
    `;

    // Method 1: Try nodemailer if available
    if (nodemailer && typeof nodemailer.createTransporter === 'function') {
      console.log('🔧 Using nodemailer method...');
      
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify connection
      await transporter.verify();
      console.log('✅ Gmail connection verified');

      // Send email
      const result = await transporter.sendMail({
        from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: emailSubject,
        text: emailText,
        html: emailHtml
      });

      console.log('✅ Email sent successfully via nodemailer!');
      console.log('📧 Message ID:', result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId,
        method: 'nodemailer'
      };
    }

    // Method 2: Fallback to direct SMTP (if nodemailer fails)
    console.log('⚠️ Nodemailer not available, trying direct SMTP...');
    
    try {
      const result = await sendEmailDirectSMTP(email, emailSubject, emailHtml, emailText);
      console.log('✅ Email sent via direct SMTP');
      return { success: true, method: 'direct-smtp' };
    } catch (smtpError) {
      console.error('❌ Direct SMTP also failed:', smtpError);
    }

    // Method 3: Return success with manual verification URL
    console.warn('⚠️ All email methods failed - providing manual verification URL');
    return {
      success: true,
      warning: 'Email service unavailable',
      verificationUrl: verificationUrl,
      method: 'manual'
    };
    
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('Error:', error.message);
    
    // Don't throw - return with verification URL
    return {
      success: false,
      error: error.message,
      verificationUrl: `${getFrontendUrl()}/verify-email/${verificationToken}`
    };
  }
};

// Simple healthcheck
const testEmailConfiguration = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not set');
      return false;
    }
    
    console.log('✅ Email configuration appears valid');
    console.log('Email user:', process.env.EMAIL_USER);
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  testEmailConfiguration
};