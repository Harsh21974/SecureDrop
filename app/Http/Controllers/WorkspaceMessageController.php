<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\WorkspaceMessage;
use App\Models\SecureItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Traits\Notifiable;

class WorkspaceMessageController extends Controller
{
    use Notifiable;
    // API: Send message
    public function store(Request $request, $workspaceId)
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'type' => 'required|in:text,file',
            'encrypted_data' => 'required|string',
            'filename' => 'nullable|string|max:255',
            'expires_in' => 'nullable|integer|min:1|max:1440',
            'max_views' => 'nullable|integer|min:1|max:100',
        ]);
        
        $workspace = Workspace::findOrFail($workspaceId);
        $recipient = User::findOrFail($request->recipient_id);
        
        // Check if sender is workspace member
        $isMember = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', Auth::id())
            ->exists();
        
        if (!$isMember && $workspace->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Check if recipient is workspace member
        $isRecipientMember = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', $request->recipient_id)
            ->exists();
        
        if (!$isRecipientMember && $recipient->id !== $workspace->owner_id) {
            return response()->json(['message' => 'Recipient is not a member of this workspace'], 400);
        }
        
        DB::beginTransaction();
        try {
            // Create secure item
            $expiresInMinutes = $request->expires_in ?? 1440;
            
            $secureItem = SecureItem::create([
                'id' => (string) Str::uuid(),
                'type' => $request->type,
                'encrypted_data' => $request->encrypted_data,
                'filename' => $request->filename,
                'expires_at' => Carbon::now()->addMinutes($expiresInMinutes),
                'max_views' => $request->max_views ?? 1,
                'view_count' => 0,
                'recipients' => [$recipient->email],
                'token' => Str::random(40),
                'user_id' => Auth::id(),
                'recipient_id' => $recipient->id,
                'encryption_type' => 'public_key',
            ]);
            
            // Create workspace message record
            $message = WorkspaceMessage::create([
                'workspace_id' => $workspaceId,
                'sender_id' => Auth::id(),
                'recipient_id' => $request->recipient_id,
                'secure_item_id' => $secureItem->id,
                'subject' => $request->subject,
                'type' => $request->type,
                'is_read' => false,
            ]);
            
            DB::commit();
            
            // Send email notification
            $decryptUrl = url("/decrypt/{$secureItem->token}");
            
            Mail::send('emails.workspace-message', [
                'sender_name' => Auth::user()->name,
                'workspace_name' => $workspace->name,
                'subject' => $request->subject ?? 'Secure Message',
                'decrypt_url' => $decryptUrl,
                'expires_at' => $secureItem->expires_at->format('F j, Y'),
            ], function ($message) use ($recipient) {
                $message->to($recipient->email)
                        ->subject('New secure message in workspace');
            });
            
            // Create in-app notification for recipient
            $decryptUrl = url("/decrypt/{$secureItem->token}");
            $this->createNotification(
                $request->recipient_id,
                'workspace_message',
                'New Workspace Message',
                Auth::user()->name . ' sent you a message in workspace "' . $workspace->name . '"',
                $decryptUrl,
                $secureItem->token
            );
            
            return response()->json([
                'message' => 'Message sent successfully',
                'message_id' => $message->id,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to send workspace message: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send message: ' . $e->getMessage()], 500);
        }
    }
    
    // API: Get messages
    public function index($workspaceId)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        $isMember = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', Auth::id())
            ->exists();
        
        if (!$isMember && $workspace->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $sentMessages = WorkspaceMessage::where('workspace_id', $workspaceId)
            ->where('sender_id', Auth::id())
            ->with(['recipient', 'secureItem'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($message) {
                return [
                    'id' => $message->id,
                    'type' => 'sent',
                    'recipient_name' => $message->recipient->name,
                    'recipient_email' => $message->recipient->email,
                    'subject' => $message->subject,
                    'token' => $message->secureItem->token ?? null,
                    'created_at' => $message->created_at,
                    'is_read' => $message->is_read,
                    'read_at' => $message->read_at,
                ];
            });
        
        $receivedMessages = WorkspaceMessage::where('workspace_id', $workspaceId)
            ->where('recipient_id', Auth::id())
            ->with(['sender', 'secureItem'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($message) {
                return [
                    'id' => $message->id,
                    'type' => 'received',
                    'sender_name' => $message->sender->name,
                    'sender_email' => $message->sender->email,
                    'subject' => $message->subject,
                    'token' => $message->secureItem->token ?? null,
                    'created_at' => $message->created_at,
                    'is_read' => $message->is_read,
                ];
            });
        
        return response()->json([
            'sent' => $sentMessages,
            'received' => $receivedMessages,
        ]);
    }
    
    // API: Mark message as read
    public function markAsRead($workspaceId, $messageId)
    {
        $message = WorkspaceMessage::where('workspace_id', $workspaceId)
            ->where('id', $messageId)
            ->where('recipient_id', Auth::id())
            ->firstOrFail();
        
        $message->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
        
        return response()->json(['message' => 'Marked as read']);
    }
    
    // API: Delete message
    public function destroy($workspaceId, $messageId)
    {
        $message = WorkspaceMessage::where('workspace_id', $workspaceId)
            ->where('id', $messageId)
            ->firstOrFail();
        
        if ($message->sender_id !== Auth::id() && $message->workspace->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $message->delete();
        
        return response()->json(['message' => 'Message deleted']);
    }
}