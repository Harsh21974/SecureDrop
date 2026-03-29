<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class SecureLinkMail extends Mailable
{
    public $link;

    public function __construct($link)
    {
        $this->link = $link;
    }

    public function build()
    {
        return $this->subject('🔐 You received a secure message')
            ->view('emails.secure-link');
    }
}