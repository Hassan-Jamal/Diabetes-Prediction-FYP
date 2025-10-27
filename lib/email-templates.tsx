export const getWelcomeEmailHTML = (organizationName: string, role: string) => {
  const isHospital = role === "hospital"
  const primaryColor = isHospital ? "#0369a1" : "#059669"
  const accentColor = isHospital ? "#e0f2fe" : "#d1fae5"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, ${accentColor} 0%, #ffffff 100%);
          }
          .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${isHospital ? "#0284c7" : "#059669"} 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 40px 20px;
            background: white;
            margin: 20px;
            border-radius: 8px;
          }
          .welcome-text {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
          }
          .highlight {
            background: linear-gradient(120deg, ${accentColor} 0%, rgba(255,255,255,0.5) 100%);
            padding: 20px;
            border-left: 4px solid ${primaryColor};
            margin: 20px 0;
            border-radius: 4px;
          }
          .features {
            margin: 30px 0;
          }
          .feature-item {
            display: flex;
            margin: 15px 0;
            align-items: flex-start;
          }
          .feature-icon {
            width: 24px;
            height: 24px;
            background: ${primaryColor};
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            font-weight: bold;
            font-size: 14px;
          }
          .feature-text {
            flex: 1;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${isHospital ? "#0284c7" : "#059669"} 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, ${primaryColor}, transparent);
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to HealthCare Portal! 🎉</h1>
            <p>${isHospital ? "Hospital Management System" : "Laboratory Management System"}</p>
          </div>

          <div class="content">
            <div class="welcome-text">
              <p>Dear <strong>${organizationName}</strong>,</p>
              <p>Thank you for joining HealthCare Portal! We're thrilled to have you on board. Your account has been successfully created and is ready to use.</p>
            </div>

            <div class="highlight">
              <strong>🚀 You're all set!</strong>
              <p>Your ${isHospital ? "hospital" : "laboratory"} account is now active. Log in to your dashboard to start managing your operations and improving patient outcomes.</p>
            </div>

            <div class="features">
              <h3 style="color: ${primaryColor}; margin-top: 0;">What You Can Do Now:</h3>
              <div class="feature-item">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <strong>${isHospital ? "Manage Consultations" : "Manage Lab Tests"}</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    ${isHospital ? "Create and track patient consultations with ease" : "Handle test requests and sample processing"}
                  </p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <strong>Diabetes Risk Assessment</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    Access AI-powered prediction tools for accurate risk assessment
                  </p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <strong>${isHospital ? "Patient Records" : "Report Generation"}</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    ${isHospital ? "Maintain comprehensive patient information" : "Generate detailed lab reports automatically"}
                  </p>
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">✓</div>
                <div class="feature-text">
                  <strong>Real-time Analytics</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    Monitor key metrics and insights on your dashboard
                  </p>
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/${isHospital ? "hospital" : "lab"}/login" class="cta-button">
                Go to Your Dashboard
              </a>
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px; color: #333;">
                <strong>Need Help?</strong> Our support team is available 24/7 to assist you. Contact us at support@healthcareportal.com or visit our help center.
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0;">© 2025 HealthCare Portal. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">Transforming Healthcare Through Technology</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export const getPasswordResetEmailHTML = (resetLink: string, role: string) => {
  const isHospital = role === "hospital"
  const primaryColor = isHospital ? "#0369a1" : "#059669"
  const accentColor = isHospital ? "#e0f2fe" : "#d1fae5"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, ${accentColor} 0%, #ffffff 100%);
          }
          .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${isHospital ? "#0284c7" : "#059669"} 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 40px 20px;
            background: white;
            margin: 20px;
            border-radius: 8px;
          }
          .alert {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${isHospital ? "#0284c7" : "#059669"} 100%);
            color: white;
            padding: 14px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            font-size: 16px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e0e0e0;
          }
          .code-box {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            text-align: center;
            margin: 20px 0;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request 🔐</h1>
          </div>

          <div class="content">
            <p>We received a request to reset your password for your HealthCare Portal account.</p>

            <div class="alert">
              <strong>⏰ Important:</strong> This link will expire in 24 hours. If you didn't request this, please ignore this email.
            </div>

            <p>Click the button below to reset your password:</p>

            <div style="text-align: center;">
              <a href="${resetLink}" class="cta-button">
                Reset Your Password
              </a>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px;">
              Or copy and paste this link in your browser:
            </p>
            <div class="code-box">
              ${resetLink}
            </div>

            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px; color: #333;">
                <strong>Security Tip:</strong> Never share your password with anyone. Our team will never ask for your password via email.
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0;">© 2025 HealthCare Portal. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">Transforming Healthcare Through Technology</p>
          </div>
        </div>
      </body>
    </html>
  `
}
