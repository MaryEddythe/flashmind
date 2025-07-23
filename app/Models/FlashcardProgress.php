<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlashcardProgress extends Model
{
    use HasFactory;

    protected $table = 'flashcard_progresses';

    protected $fillable = [
        'flashcard_id',
        'times_seen',
        'times_wrong',
        'last_seen',
    ];

    protected $casts = [
        'last_seen' => 'datetime',
    ];

    /**
     * Get the flashcard that owns the progress.
     */
    public function flashcard(): BelongsTo
    {
        return $this->belongsTo(Flashcard::class);
    }
}
