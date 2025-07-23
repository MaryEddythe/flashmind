<?php

namespace App\Http\Controllers\Flashcards;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use App\Models\FlashcardProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudyController extends Controller
{
    /**
     * Get flashcards for a study session.
     * This can be enhanced to fetch based on AI optimization later.
     */
    public function getStudySession(Request $request)
    {
        $query = Flashcard::query();

        if ($request->has('subject')) {
            $query->where('subject', $request->input('subject'));
        }

        $flashcards = $query->with('progress')->get()->map(function ($card) {
            $progress = $card->progress;
            return [
                'id' => $card->id,
                'subject' => $card->subject,
                'front' => $card->front,
                'back' => $card->back,
                'times_seen' => $progress ? $progress->times_seen : 0,
                'times_wrong' => $progress ? $progress->times_wrong : 0,
                'last_seen' => $progress ? $progress->last_seen : null,
            ];
        });

        // Default order for study session (can be overridden by AI)
        // For now, let's sort by last_seen (oldest first) and then by times_wrong (most wrong first)
        $sortedFlashcards = $flashcards->sortBy(function ($card) {
            return $card['last_seen'] ?? '1970-01-01 00:00:00'; // Treat null as very old
        })->sortByDesc('times_wrong')->values();


        return response()->json(['data' => $sortedFlashcards, 'success' => true]);
    }

    /**
     * Update flashcard progress after a study attempt.
     */
    public function updateFlashcardProgress(Request $request)
    {
        $request->validate([
            'flashcard_id' => 'required|exists:flashcards,id',
            'correct' => 'required|boolean',
        ]);

        $flashcardId = $request->input('flashcard_id');
        $correct = $request->input('correct');

        $progress = FlashcardProgress::firstOrCreate(
            ['flashcard_id' => $flashcardId],
            ['times_seen' => 0, 'times_wrong' => 0, 'last_seen' => null]
        );

        $progress->increment('times_seen');
        if (!$correct) {
            $progress->increment('times_wrong');
        }
        $progress->last_seen = now();
        $progress->save();

        return response()->json(['data' => $progress, 'message' => 'Progress updated successfully!', 'success' => true]);
    }

    /**
     * Get all flashcard progress.
     */
    public function getFlashcardProgress()
    {
        $progress = FlashcardProgress::all()->map(function ($item) {
            $accuracyRate = $item->times_seen > 0 ? (($item->times_seen - $item->times_wrong) / $item->times_seen) * 100 : 100;
            return [
                'flashcard_id' => $item->flashcard_id,
                'times_seen' => $item->times_seen,
                'times_wrong' => $item->times_wrong,
                'last_seen' => $item->last_seen,
                'accuracy_rate' => round($accuracyRate, 2),
            ];
        });

        return response()->json(['data' => $progress, 'success' => true]);
    }
}
