<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Flashcard extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'front',
        'back',
    ];

    /**
     * Get the progress associated with the flashcard.
     */
    public function progress(): HasOne
    {
        return $this->hasOne(FlashcardProgress::class);
    }
}
