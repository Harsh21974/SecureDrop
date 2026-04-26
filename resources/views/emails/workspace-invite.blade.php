<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workspace Invitation</title>
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
        .workspace-name {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .workspace-name p {
            margin: 0;
            color: #166534;
            font-weight: 500;
        }
        .button {
            display: inline-block;
            background-color: #0d9488;
            color: white !important;
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
        .expiry-note {
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Workspace Invitation</h1>
            </div>
            
            <div class="content">
                <p style="font-size: 16px; margin-bottom: 16px;">Hello,</p>
                
                <p><strong>{{ $invited_by }}</strong> has invited you to join their workspace on <strong>SecureDrop</strong>.</p>
                
                <div class="workspace-name">
                    <p>📁 {{ $workspace_name }}</p>
                </div>
                
                <div style="text-align: center;">
                    <a href="{{ $accept_url }}" class="button">Accept Invitation</a>
                </div>
                
                <p style="font-size: 14px; color: #4b5563; margin-top: 20px;">
                    By joining this workspace, you'll be able to:
                </p>
                <ul style="font-size: 14px; color: #4b5563;">
                    <li>Collaborate securely with team members</li>
                    <li>Share encrypted files and messages</li>
                    <li>Manage workspace content together</li>
                </ul>
                
                <div class="expiry-note">
                    This invitation expires on <strong>{{ $expires_at }}</strong>
                </div>
                
                <p style="font-size: 13px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    If you don't have a SecureDrop account yet, you'll be prompted to create one when you accept this invitation.
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