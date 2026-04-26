<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Secure Message</title>
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
        .content {
            padding: 32px 24px;
        }
        .message-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #0d9488;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px 24px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>🔒 New Secure Message</h1>
            </div>
            
            <div class="content">
                <p style="font-size: 16px; margin-bottom: 16px;">Hello,</p>
                
                <p><strong>{{ $sender_name }}</strong> has sent you a secure message in workspace <strong>{{ $workspace_name }}</strong>.</p>
                
                <div class="message-box">
                    <p style="margin: 0; color: #166534; font-weight: 500;">
                        Subject: {{ $subject }}
                    </p>
                </div>
                
                <div style="text-align: center;">
                    <a href="{{ $decrypt_url }}" class="button">View Secure Message →</a>
                </div>
                
                <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">
                    This message will expire on <strong>{{ $expires_at }}</strong>.
                </p>
            </div>
            
            <div class="footer">
                <p>SecureDrop - End-to-end encrypted file and text sharing</p>
                <p>&copy; {{ date('Y') }} SecureDrop. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>