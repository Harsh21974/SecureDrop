<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Message from SecureDrop</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 560px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .card {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #0d9488;
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            color: white;
            font-size: 24px;
            margin: 0;
            font-weight: 600;
        }
        .header .badge {
            display: inline-block;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 12px;
            color: white;
            margin-top: 12px;
        }
        .content {
            padding: 32px 24px;
        }
        .message-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .message-box .lock-icon {
            font-size: 32px;
            margin-bottom: 12px;
        }
        .message-box p {
            margin: 0;
            color: #166534;
            font-weight: 500;
        }
        .info-list {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
        }
        .info-list li {
            margin: 8px 0;
            color: #4b5563;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #0d9488;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .warning-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 13px;
            color: #92400e;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px 24px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        .expiry-note {
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            margin-top: 16px;
        }
        @media only screen and (max-width: 480px) {
            .button {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>🔒 Secure Message</h1>
                <div class="badge">End-to-End Encrypted</div>
            </div>
            
            <div class="content">
                <p style="font-size: 16px; margin-bottom: 16px;">Hello,</p>
                
                <p><strong>{{ $sender_name }}</strong> has sent you a secure message via <strong>SecureDrop</strong>.</p>
                
                <div class="message-box">
                    <div class="lock-icon">🔐</div>
                    <p>This message is encrypted end-to-end</p>
                </div>
                
                <div class="info-list">
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>✅ Military-grade AES-256 encryption</li>
                        <li>⏱ Link expires based on sender's settings</li>
                        <li>👁 Limited number of views (as set by sender)</li>
                        <li>🔑 Password required to decrypt</li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <a href="{{ $link }}" class="button" style="color: #ffffff !important; background-color: #0d9488; text-decoration: none; display: inline-block; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0;">
                        Open Secure Message →
                    </a>
                </div>
                
                <div class="warning-note">
                    <strong>⚠️ Important Security Notice</strong><br>
                    This link will expire after the specified time or view limit. The decryption password was provided separately by the sender.
                </div>
                
                <div class="expiry-note">
                    This secure message link may expire based on the sender's settings (time limit or view count).
                </div>
                
                <p style="font-size: 13px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    SecureDrop ensures that your message is encrypted before it leaves the sender's device and can only be decrypted with the correct password.
                </p>
            </div>
            
            <div class="footer">
                <p>SecureDrop - End-to-end encrypted file and text sharing</p>
                <p>Built for privacy-first communication</p>
                <p>&copy; {{ date('Y') }} SecureDrop. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>